import { useDispatch, useSelector } from "react-redux"
import NetworkPanel from "./network-panel"
import { changeNetwork, changeState } from "../../shared/store/reducers/network.reducer"
import { useNavigate } from "react-router"

const NetworkPanelContainer = () => {

    const navigate = useNavigate()

    const dispatch = useDispatch()
    const network = useSelector(state => state.network.network)

    function connectToGPRS() {
        navigate('/gprs')
    }

    function connectToLTE() {
        navigate('/lte')
    }

    function disconnect() {
        dispatch(changeNetwork({ network: 'NO_NETWORK' }))
        dispatch(changeState({ state: 'IDLE' }))
        navigate('/')
    }

    const props = {
        network,
        connectToGPRS,
        connectToLTE,
        disconnect
    }

    return (
        <NetworkPanel {...props} />
    )
}

export default NetworkPanelContainer