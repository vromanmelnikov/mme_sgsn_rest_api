import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { changeNetwork, changeState } from "../../../shared/store/reducers/network.reducer"
import GPRS from "./GPRS"
import useGPRS from "../../../shared/services/gprs.service"

const GPRSContainer = () => {

    const dispatch = useDispatch()

    const gprsService = useGPRS()

    useEffect(
        () => {
            dispatch(changeNetwork({ network: 'GPRS' }))
            // dispatch(changeState({ state: 'READY' }))
            // eslint-disable-next-line
        }, []
    )

    function createConnection(event) {
        event.preventDefault()
        gprsService.createConnection()
    }

    const props = {
        createConnection
    }

    return (
        <GPRS {...props} />
    )
}

export default GPRSContainer