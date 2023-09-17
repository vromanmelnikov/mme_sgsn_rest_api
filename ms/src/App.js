import { useRoutes } from 'react-router';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import routes from './routes/routes'

function App() {

  const Routes = useRoutes(routes)

  return (
    <div>
      {Routes}
    </div>
  );
}

export default App;
