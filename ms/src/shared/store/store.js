import networkReducer from "./reducers/network.reducer";

const { configureStore } = require("@reduxjs/toolkit");

const store = configureStore({
    reducer: {
        network: networkReducer
    }
})

export default store