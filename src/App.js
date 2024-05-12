import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import NavBar from './components/NavBar';
import AddProductForm from './components/AddProductForm';
import Products from './components/Products';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import Clients from './components/Clients';
import FullScreen from './components/FullScreen';



const App = () => {
  return (
    <div className="App">
      <FullScreen />
      <NavBar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/add_product" component={AddProductForm} />
        <Route path="/clients" component={Clients} />
        <Route path="/orders" component={Orders} />
      </Switch>
    </div>
  );
}

export default App;
