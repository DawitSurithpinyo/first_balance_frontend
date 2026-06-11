import { useTransactions } from "@/stores/transactionsStore"
import getTransactions from "@/lib/getTransactions"

import Table from "./table/table"
import Toolbar from "./toolbar"
import CreateForm from "./table/createForm"

import { useEffect } from "react"

export default function Entries() {
    const transactionsNeedRefetch = useTransactions((state) => state.needRefetch)
    const loadTransactions = useTransactions((state) => state.loadTransactions)
    const setTransactionsNeedRefetch = useTransactions((state) => state.setNeedRefetch)

    useEffect(() => {
        const get = async () => {
            await getTransactions(loadTransactions, setTransactionsNeedRefetch)
        }
        if (transactionsNeedRefetch) {
            get()
        }
    }, [])

    return (
        <>
            <Toolbar/>
            <Table/>
            <CreateForm/>
        </>
    )
}