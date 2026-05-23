import { useTransactions } from "@/stores/transactionsStore"
import Table from "./table"
import { useEffect } from "react"
import getTransactions from "@/lib/getTransactions"

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
            <Table/>
        </>
    )
}