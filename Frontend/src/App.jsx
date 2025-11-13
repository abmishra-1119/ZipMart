import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import Signup from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ProductDetails from './pages/ProductDetails'
import SearchPage from './pages/SearchPage'
import CartPage from './pages/CartPage'

function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"  // or "light"
        />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/products/:id' element={<ProductDetails />} />
          <Route path='/search' element={<SearchPage />} />
          <Route path='/cart' element={<CartPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
