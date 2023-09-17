import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addMessage, changeState, set_MME_ENB_ID } from "../store/reducers/network.reducer"

export const LTE_API = 'ws://localhost:5011'

function useLTE() {

    const dispatch = useDispatch()

    const [socket, setSocket] = useState(null)

    const state = useSelector(state => state.network.networkState)
    const msData = useSelector(state => state.network.msData)

    useEffect(
        () => {
            return () => {
                detachRequest()
            }
            // eslint-disable-next-line
        }, [socket]
    )

    useEffect(
        () => {
            if (state === 'STANDBY') {
                setTimeout(
                    () => {
                        detachRequest()
                    }, 5000
                );
            }
        }, [state]
    )

    useEffect(
        () => {
            if (socket !== null) {
                socket.onopen = () => {
                    dispatch(changeState({ state: 'READY' }))
                    attachRequest(socket)
                }
                socket.onclose = () => {
                    setSocket(null)
                    // dispatch(addMessage({
                    //     message: {
                    //         type: 'ERROR',
                    //         text: 'Disconnect from network!'
                    //     }
                    // }))
                    dispatch(changeState({ state: 'IDLE' }))
                }
                socket.onmessage = (event) => {

                    let message = event.data
                    if (message) {
                        message = JSON.parse(message)
                        checkMessage(message)
                    }
                }
            }
            // eslint-disable-next-line
        }, [socket]
    )

    function sendAuthenticationResponse(message) {

        const { ENB_UE_S1AP_ID, MME_UE_S1AP_ID } = { ...message }

        dispatch(set_MME_ENB_ID({ MME_UE_S1AP_ID, ENB_UE_S1AP_ID }))

        socket.send(JSON.stringify({
            type: 'AUTHENTICATION_RESPONSE',
            MME_UE_S1AP_ID,
            ENB_UE_S1AP_ID,
            RES: ''
        }))

        
        dispatch(addMessage({
            message: {
                type: 'TEXT',
                text: 'Authentication in the network...'
            }
        }))

    }

    function sendSecurityModeComplete(message) {

        const { ENB_UE_S1AP_ID, MME_UE_S1AP_ID } = { ...message }

        socket.send(JSON.stringify({
            type: 'SECURITY_MODE_COMPLETE',
            IMEISV: msData.IMEISV,
            MME_UE_S1AP_ID,
            ENB_UE_S1AP_ID,
        }))

        dispatch(addMessage({
            message: {
                type: 'TEXT',
                text: 'Security mode functions...'
            }
        }))

    }

    function sendESMInfo(message) {

        const { ENB_UE_S1AP_ID, MME_UE_S1AP_ID } = { ...message }

        socket.send(JSON.stringify({
            type: 'ESM_INFORMATION_RESPONSE',
            APN: 'internet.tele2.ru',
            MME_UE_S1AP_ID,
            ENB_UE_S1AP_ID,
        }))

        dispatch(addMessage({
            message: {
                type: 'TEXT',
                text: 'EPS session managment functions...'
            }
        }))

    }

    function sendAttachAccept(message) {

        const { ENB_UE_S1AP_ID, MME_UE_S1AP_ID } = { ...message }

        socket.send(JSON.stringify({
            type: 'ATTACH_COMPLETE',
            APN: 'internet.tele2.ru',
            MME_UE_S1AP_ID,
            ENB_UE_S1AP_ID,
            TAI: '',
            CGI: ''
        }))

    }

    function checkMessage(message) {

        console.log(message)

        switch (message.type) {
            case "AUTHENTICATION_REQUEST": {
                sendAuthenticationResponse(message)
                break
            }
            case 'SECURITY_MODE_COMMAND': {
                sendSecurityModeComplete(message)
                break
            }
            case 'ESM_INFORMATION_REQUEST': {
                dispatch(addMessage({
                    message: {
                        type: 'SUCCESS',
                        text: 'Authorized in the network!'
                    }
                }))
                sendESMInfo(message)
                break
            }
            case 'INITIAL_CONTEXT_SETUP_REQUEST/ATTACH_ACCEPT/ACTIVATE_DEFAULT_EPS_BEARER_CONTEXT_REQUEST': {
                dispatch(addMessage({
                    message: {
                        type: 'SUCCESS',
                        text: 'Bearer has been established! You can send your packets...'
                    }
                }))
                sendAttachAccept(message)
                break
            }
            default: {

            }
        }
    }

    function attachRequest(socket) {
        socket.send(JSON.stringify({
            type: 'INITIAL_UE_MESSAGE/ATTACH_REQUEST/PDP_CONNECTIVITY_REQUEST',
            TAI: '',
            GUTI: ''
        }))
        dispatch(addMessage({
            message: {
                type: 'TEXT',
                text: 'Waiting packet tramsmission...'
            }
        }))
    }

    function createConnection() {

        if (socket === null) {
            let socket = new WebSocket(LTE_API)
            setSocket(socket)
        }

    }

    function detachRequest() {
        if (socket !== null) {
            // socket.send(JSON.stringify({
            //     message: '',
            //     type: 'DETACH_REQUEST'
            // }))
            socket.close()
        }

    }

    return { createConnection, detachRequest }

}

export default useLTE