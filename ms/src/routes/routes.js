import GPRSContainer from "../components/network/GPRS/GPRS.container";
import LTEContainer from "../components/network/LTE/LTE.container";
import NoNetworkContainer from "../components/network/no-network/no-network.container";
import SystemContainer from "../components/system.container";

const routes = [
    {
        path: '',
        element: <SystemContainer />,
        children: [
            {
                path: '/',
                element: <NoNetworkContainer />
            },
            {
                path: 'gprs',
                element: <GPRSContainer/>
            },
            {
                path: 'lte',
                element: <LTEContainer/>
            },
        ]
    }
]

export default routes