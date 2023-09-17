import { Outlet } from "react-router"
import { Card, CardBody, CardHeader } from "reactstrap"
import StateContainer from "./state/state.container"
import ConsoleContainer from "./console/console.container"

const Network = () => {

    // const gprsService = new useGPRS()

    return(
        <Card>
            <CardHeader>Состояние сети и логи</CardHeader>
            <CardBody>
                <Outlet />
                <ConsoleContainer />
                <StateContainer />
            </CardBody>
        </Card>
    )
}

export default Network