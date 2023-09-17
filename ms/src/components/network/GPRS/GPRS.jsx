import { Form, Input } from "reactstrap"

const GPRS = (props) => {

    return(
        <Form className="d-flex mb-3 gap-3" onSubmit={(event) => props.createConnection(event)}>
            <Input style={{width: '70%'}} type="text" placeholder="Передайте сообщение"/>
            <Input style={{width: '30%', backgroundColor: '#0d6efd', color: 'white'}} type="submit"/>
        </Form>
    )
}

export default GPRS