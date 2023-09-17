import { useEffect } from "react"
import useLTE from "../../../shared/services/lte.service"
import LTE from "./LTE"

const LTEContainer = (props) => {

    const lteService = useLTE()

    useEffect(
        () => {
            lteService.createConnection()
        }, []
    )

    return (
        <LTE />
    )
}

export default LTEContainer