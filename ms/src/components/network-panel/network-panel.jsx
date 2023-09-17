import { Button, Card, CardBody, CardFooter, CardHeader } from "reactstrap"

import Class from './network-panel.module.css'

const NetworkPanel = (props) => {

    return (
        <Card>
            <CardHeader>
                Выбор сети
            </CardHeader>
            <CardBody className={Class.networkButtons}>
                <Button color="primary" onClick={props.connectToLTE}>
                    4G
                </Button>
                <Button color="primary" onClick={props.connectToGPRS}>
                    2G/3G
                </Button>
                <Button color="danger" className={Class.disconnect} onClick={props.disconnect}>
                    Отсоединиться от сети
                </Button>
            </CardBody>
            {/* <CardFooter>
                <h1>{props.network}</h1>
            </CardFooter> */}
        </Card>
    )
}

export default NetworkPanel