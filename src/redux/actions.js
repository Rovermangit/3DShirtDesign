export const updateUserData = data => dispatch =>{
    dispatch({
        type:'updateUserData',
        payload: data
    })
}