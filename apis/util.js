module.exports.getFileExt = function(filename) {
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length)
}

/*
 * async 내에서 예외가 발생하는 경우 async 내에서 자체 예외 처리를 하는 경우는 상관이 없겠으나,
 * app.js 에서 예외 관리를 통합적으로 하기 위하여 async 내에서 따로 예외 처리를 안하는 경우,
 * 반드시 아래 함수로, 콜백 함수를 래핑해야 함.
 * 만약 래핑하지 않은 상태에서 예외가 발생하면, 애플리케이션(Express)이 종료될 수 있음.
 * Express는 sync 내에서 발생한 예외만 처리가 가능함.
 */
module.exports.wrapAsync = function(fn) {
    return function (req, res, next) {
        // 모든 오류를 .catch() 처리하고 체인의 next() 미들웨어에 전달하세요
        // (이 경우에는 오류 처리기)
        fn(req, res, next)  //.catch(next)를 삭제함 by Yeo 2021-09-29
    }
}
