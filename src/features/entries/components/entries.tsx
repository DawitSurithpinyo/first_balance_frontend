import { useTransactions } from "@/stores/transactionsStore"
import getTransactions from "@/lib/getTransactions"

import "@/features/entries/components/entries.css"
import Table from "@/features/entries/components/table/table"
import Toolbar from "@/features/entries/components/toolbar"
import CreateForm from "@/features/entries/components/table/createForm"

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
        <div id="entries">
            <Toolbar/>
            <Table/>
            <CreateForm/>
        </div>
    )
}