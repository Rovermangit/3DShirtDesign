
const initState = {
    userData:{}
}
export function ModalReducer(preState = initState,action){
    const {type,payload} = action;
    switch(type){
        case 'updateUserData':
            preState.userData = payload;
            return JSON.parse(JSON.stringify(preState));
        default:
            return preState
    }
}