import { createAction, createReducer } from "@reduxjs/toolkit";

const ADD_MESSAGE = 'ADD_MESSAGE'
const CHANGE_STATE = 'CHANGE_STATE'
const CHANGE_NETWORK = 'CHANGE_NETWORK'
const CHANGE_SOCKET = 'CHANGE_SOCKET'

const ATTACH_CHANGES = 'ATTACH_CHANGES'
const ACTIVATE_PDP_CONTEXT_CHANGES = 'ACTIVATE_PDP_CONTEXT_CHANGES'

const SET_MME_ENB_ID = 'set_MME_ENB_ID'

export const addMessage = createAction(ADD_MESSAGE)
export const changeState = createAction(CHANGE_STATE)
export const changeNetwork = createAction(CHANGE_NETWORK)
export const changeSocket = createAction(CHANGE_SOCKET)
export const setAttachChanges = createAction(ATTACH_CHANGES)
export const setActivatePDPChanges = createAction(ACTIVATE_PDP_CONTEXT_CHANGES)
export const set_MME_ENB_ID = createAction(SET_MME_ENB_ID)

const initialState = {
    messages: [],
    networkState: 'IDLE',
    network: 'NO_NETWORK',
    socket: null,
    msData: {
        IMEISV: '',
        IMSI: '250203908244998',
        MSISDN: '79308190001',
        P_TMSI: '3234349114',
        M_TMSI: '3234349114',
        GUTI: '',
        IP: '',
        APN: 'internet.tele2.ru',
        RAI: '250-20-58875-225',
        TAI: '',
        NSAPI: '5',
        LLCSAPI: '3',
        MME_UE_S1AP_ID: '',
        ENB_UE_S1AP_ID: ''
    }
}

const networkReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(addMessage, (state, action) => {
            const message = action.payload.message
            state.messages = [...state.messages, { ...message }]
        })
        .addCase(changeState, (state, action) => {
            const networkState = action.payload.state
            state.networkState = networkState
        })
        .addCase(changeNetwork, (state, action) => {
            const network = action.payload.network
            state.network = network
        })
        .addCase(changeSocket, (state, action) => {
            const socket = action.payload.socket
            state.socket = socket
        })
        .addCase(setAttachChanges, (state, action) => {
            const RAI = action.payload.RAI
            const P_TMSI = action.payload.P_TMSI
            state.msData = {
                ...state.msData,
                RAI,
                P_TMSI
            }
        })
        .addCase(setActivatePDPChanges, (state, action) => {
            const IP = action.payload.PDP_ADDRESS
            const LLCSAPI = action.payload.LLCSAPI
            state.msData = {
                ...state.msData,
                IP,
                LLCSAPI
            }
        })
        .addCase(set_MME_ENB_ID, (state, action) => {
            const { ENB_UE_S1AP_ID, MME_UE_S1AP_ID } = { ...action.payload }
            state.msData = {
                ...state.msData,
                ENB_UE_S1AP_ID,
                MME_UE_S1AP_ID
            }
        })
})

export default networkReducer