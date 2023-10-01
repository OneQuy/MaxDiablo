/*
  USAGE:

    // DECLARE
    const measure = useRef<CachedMeassure>(new CachedMeassure(true))

    // USE
    const someMethod = useCallback(() => {
      measure.current.GetOrMessure((res: CachedMeassureResult) => {
        // use the res.
      })
    }, [])

    // AT VIEW
     <View ref={measure.current.theRef} />

*/
import { useRef } from "react";
import { IsPointInRect } from "./UtilsTS";

export type CachedMeassureResult = {
  x: number,
  y: number,
  width: number,
  height: number,
  px: number,
  py: number
}

export class CachedMeassure {
  theRef: any;
  private constantResult: boolean;
  private result: CachedMeassureResult | null;

  constructor(constantResult: boolean) {
    this.theRef = useRef(null);
    this.constantResult = constantResult;
    this.result = null;
  }

  GetOrMessure(callback: (result: CachedMeassureResult) => void) {
    if (this.result !== null && this.constantResult) {
      callback(this.result);
    }
    else if (!this.theRef?.current) {
      throw new Error("theRef is undefined. It must be set in a ref of element before calling this.");      
    }
    else {
      this.theRef.current.measure((x: number, y: number, width: number, height: number, px: number, py: number) => {
        if (x + y + width + height + px + py === 0)
          throw new Error("GetOrMessure giving all zero result. It is calling incorrected time.");      
        
          this.result = { x, y, width, height, px, py };
        callback(this.result);
      });
    }
  }

  DistanceWithElement(other: CachedMeassure, callback: ({x, y} : {x: number, y: number}) => void) {
    this.GetOrMessure(resA => {
      other.GetOrMessure(resB => {
        callback({x:  resA.px - resB.px, y: resA.py - resB.py});
      });
    });
  }

  static DistanceWithElement(target: React.MutableRefObject<CachedMeassure>, other: React.MutableRefObject<CachedMeassure>, callback: ({x, y} : {x: number, y: number}) => void) {
    target.current.DistanceWithElement(other.current, callback);    
  }
}

export const IsPointInRectMeasure = ( // main
    x: number, 
    y: number, 
    measure: CachedMeassureResult) => {
    return IsPointInRect(x, y, measure.px, measure.py, measure.width, measure.height)
}