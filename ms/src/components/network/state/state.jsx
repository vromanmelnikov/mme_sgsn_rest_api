import { useSelector } from 'react-redux'
import Class from './state.module.css'

import { Badge } from "reactstrap"
import { useEffect } from 'react'

const State = () => {

    const state = useSelector(state => state.network.networkState)

    return (
        <div className={Class.container}>
            <h4><Badge className={state === 'IDLE' ? Class.active : Class.state} color='secondary'>
                IDLE
            </Badge></h4>
            <h4><Badge className={state === 'STANDBY' ? Class.active : Class.state} color='warning'>
                STANDBY
            </Badge></h4>
            <h4><Badge className={state === 'READY' ? Class.active : Class.state} color='success'>
                READY
            </Badge></h4>
        </div>
    )
}

export default State