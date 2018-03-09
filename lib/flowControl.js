'use strict';

// helper function,
// that will make calls to func,
// with each element of the set that receives (arr)
// when it finishes, it will call callbackEnd
const serialArray = function (arr, func, callbackEnd) {
  if (arr.length > 0) {
    // Take out the first element of the array and
    // call to type serialArray with the element
    func(arr.shift(), function (err) {
      if (err) {
        return callbackEnd(err);
      }

      // when finish func, call at the same / itself 
      // (series) to process the following
      serialArray(arr, func, callbackEnd);
    });
  } else {
    // if arr.length reaches 0 it has finished,
    // then call the function they passed
    // for this, callbackEnd
    callbackEnd();
  }
};

module.exports = {
  serialArray: serialArray
};
