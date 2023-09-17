import { useSelector } from 'react-redux'
import Class from './console.module.css'

const Console = () => {

    const messages = useSelector(state => state.network.messages) 

    return (
        <div className={Class.console}>
            {
                messages.map(
                    (item, index) => {
                        return (
                            <span key={index} className={(item.type === 'ERROR' && Class.error) || (item.type === 'SUCCESS' && Class.success) || (item.type === 'TEXT' && Class.text)}>
                                - {item.text}
                            </span>
                        )
                    }
                )
            }
        </div>
    )
}

export default Console