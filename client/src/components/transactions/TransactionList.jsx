import TransactionItem from "./TransactionItem";

const TransactionList = ({ transactions }) => {
    return (
        <div className="space-y-2">
            {transactions.map(tx => (
                <TransactionItem key={tx._id} transaction={tx} />
            ))}
        </div>
    );
};

export default TransactionList;
