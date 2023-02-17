
const initState = {
    shirtColor:'0'
}
export function ModalReducer(preState = initState,action){
    const {type,payload} = action;
    switch(type){
        case 'changeShirtScheme':
            preState.shirtColor = payload;
            return preState
        default:
            return preState
    }
}