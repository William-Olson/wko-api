// curry a an old function with some initial fixed arg values
module.exports = (oldFn, ...fixedArgs) => {

  // return a new function to call with other args
  return async (...newArgs) => {
    const allArgs = [ ...fixedArgs, ...newArgs ];
    return await oldFn(...allArgs);
  };
};



