import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {getAllProducts} from "../features/product/productSlice.js";

const Home = () => {
const dispatch = useDispatch()

    const {products} = useSelector((state)=> state.products)

    useEffect(() => {
    dispatch(getAllProducts({}))
    }, [dispatch]);

    return (
        <div>
            This is Home Page
            {console.log(products)}
        </div>
    );
}

export default Home;
