import Class from './system.module.css'

import { Col, Container, Row } from "reactstrap"

import NetworkPanelContainer from "./network-panel/network-panel.container"
import Network from "./network/network"
import NetworkSettingsContainer from './network-settings/network-settings.container'

const System = () => {

    return (
        <Container>
            <Row>
                <header className={Class.header}>
                    Шапка
                </header>
            </Row>
            <Row>
                <Col xs='4'>
                    <NetworkPanelContainer />
                    <NetworkSettingsContainer />
                </Col>
                <Col xs='8'>
                    <Network />
                </Col>
            </Row>
        </Container>
    )
}

export default System