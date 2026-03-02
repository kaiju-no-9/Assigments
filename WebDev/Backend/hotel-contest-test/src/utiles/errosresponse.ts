
export const SuccessResponse = <T>(data : T) => {
    return {
        success : true,
        data,
        error :null
    }
}
export const ErrorResponse = (err: string) => {
    return {
        success : false,
        data :null,
        error:err
    }
}
// custum error class
class ApiErrorRespose extends Error {
    statusCode : number
    constructor(message : string , statusCode : number) {
        super(message)
        this.statusCode = statusCode
    }
}

export {ApiErrorRespose};