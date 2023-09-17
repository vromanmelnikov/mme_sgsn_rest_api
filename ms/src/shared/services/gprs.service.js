import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addMessage, changeState, setActivatePDPChanges, setAttachChanges } from "../store/reducers/network.reducer"

export const GPRS_API = 'ws://localhost:5001'

function useGPRS() {

    const dispatch = useDispatch()

    const [socket, setSocket] = useState(null)
    const [idleTimer, setIdleTimer] = useState(null)

    const state = useSelector(state => state.network.networkState)
    const msData = useSelector(state => state.network.msData)

    useEffect(
        () => {
            return () => {
                detachRequest()
            }
        }, []
    )

    useEffect(
        () => {
            if (state === 'STANDBY') {
                dispatch(addMessage({
                    message: {
                        type: 'TEXT',
                        text: 'Waiting packet tramsmission...'
                    }
                }))
                setIdleTimer(setTimeout(
                    () => {
                        dispatch(addMessage({
                            message: {
                                type: 'ERROR',
                                text: 'No packets!'
                            }
                        }))
                        sendDiactivatePDPRequest()
                        alert('Timer has been gone!')
                    }, 5000
                ))
            }
            else if (state === 'READY') {
                clearTimeout(idleTimer)
                setIdleTimer(null)
                sendPackets()
            }
        }, [state]
    )

    useEffect(
        () => {
            if (socket !== null) {
                socket.onopen = () => {
                    attachRequest(socket)
                }
                socket.onmessage = (event) => {
                    const message = JSON.parse(event.data)
                    checkMessage(message)
                }
                socket.onclose = () => {
                    setSocket(null)
                    dispatch(addMessage({
                        message: {
                            type: 'ERROR',
                            text: 'Disconnect from network!'
                        }
                    }))
                    dispatch(changeState({ state: 'IDLE' }))
                }
            }
            // eslint-disable-next-line
        }, [socket]
    )

    function sendDiactivatePDPRequest() {
        socket.send(JSON.stringify({
            type: 'DEACTIVATE_PDP_CONTEXT_REQUEST',
            LLCSAPI: msData.LLCSAPI
        }))
        dispatch(addMessage({
            message: {
                type: 'TEXT',
                text: 'Send PDP-context deactivation message...'
            }
        }))
    }

    function sendActivatePdpContextRequest() {
        socket.send(JSON.stringify({
            message: '',
            type: 'ATTACH_COMPLETED'
        }))
        dispatch(addMessage({
            message: {
                type: 'TEXT',
                text: 'Try to send packets...'
            }
        }))
    }

    function sendAttachComplited() {
        socket.send(JSON.stringify({
            type: 'ACTIVATE_PDP_CONTEXT_REQUEST',
            APN: msData.APN + '.gprs',
            NSAPI: msData.NSAPI,
            LLCSAPI: msData.LLCSAPI,
            P_TMSI: msData.P_TMSI
        }))
        dispatch(addMessage({
            message: {
                type: 'SUCCESS',
                text: 'Connected to 2G/3G'
            }
        }))
        sendActivatePdpContextRequest()
    }

    function sendIndentifyResponse() {
        socket.send(JSON.stringify({
            IMEISV: msData.IMEISV,
            P_TMSI: msData.P_TMSI,
            type: 'IDENTIFY_RESPONSE'
        }))
        dispatch(addMessage({
            message: {
                type: 'TEXT',
                text: 'Identifying your MS...'
            }
        }))
    }

    function sendPackets() {
        dispatch(addMessage({
            message: {
                type: 'TEXT',
                text: 'Sending your message...'
            }
        }))
        setTimeout(
            () => {
                dispatch(changeState({ state: 'STANDBY' }))
            }, 5000
        )
    }

    function setAttachAcceptChanges(message) {

        dispatch(setAttachChanges({
            RAI: message.RAI,
            P_TMSI: message.P_TMSI
        }))

    }

    function setActivatePDPContextChanges(message) {

        dispatch(setActivatePDPChanges({
            PDP_ADDRESS: message.PDP_ADDRESS,
            LLCSAPI: message.LLCSAPI
        }))

    }

    function checkMessage(message) {

        switch (message.type) {
            case 'ATTACH_ACCEPT': {
                setAttachAcceptChanges(message)
                sendAttachComplited()
                break
            }
            case 'IDENTIFY_REQUEST': {
                sendIndentifyResponse()
                break
            }
            case 'ACTIVATE_PDP_CONTEXT_ACCEPT': {
                setActivatePDPContextChanges(message)
                sendPackets()
                break
            }
            case 'DEACTIVATE_PDP_CONTEXT_ACCEPT': {
                detachRequest()
            }
            default: {

            }
        }
    }

    function createConnection() {

        if (socket === null) {
            let socket = new WebSocket(GPRS_API)
            setSocket(socket)
            dispatch(changeState({ state: 'READY' }))
        }
        else if (state === 'STANDBY') {
            dispatch(changeState({ state: 'READY' }))
        }

    }

    function attachRequest(socket) {

        socket.send(
            JSON.stringify({
                type: 'ATTACH_REQUEST',
                P_TMSI: msData.P_TMSI,
                RAI: msData.RAI,
                ATTACH_TYPE: 'GPRS Attach'
            })
        )

    }

    function sendMessage() {
        if (socket !== null) {
            socket.send(JSON.stringify({
                message: 'Connection is existed!'
            }))
        }
    }

    function detachRequest() {
        if (socket !== null) {
            console.log('CLOSING')
            socket.send(JSON.stringify({
                P_TMSI: msData.P_TMSI,
                type: 'DETACH_REQUEST'
            }))
            alert('CLOSING')
            socket.close()
        }

    }

    return { createConnection, attachRequest, sendMessage, detachRequest }

}

export default useGPRS