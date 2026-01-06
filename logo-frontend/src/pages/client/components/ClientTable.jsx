import ClientRow from "./ClientRow";

export default function ClientTable({
  customers,
  selectedCustomers,
  onCheckboxChange,
  onContextMenu,
  openMenuId,
  onToggleMenu,
  onEdit,
  onOpenStatement,
  onArchiveToggle,
}) {
  return (
    <div className="bg-gray-900/20 border border-gray-800 rounded-[2.5rem] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/40 text-gray-400 border-b border-gray-800">
              <th className="p-5 w-12 text-center"></th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest">
                Unvan / Adres
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest">
                Bölge
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest text-right">
                Bakiye
              </th>
              <th className="p-5 text-xs font-bold uppercase tracking-widest text-center">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {customers.map((customer) => (
              <ClientRow
                key={customer.id}
                customer={customer}
                isSelected={selectedCustomers.includes(customer.id)}
                onCheckboxChange={onCheckboxChange}
                onContextMenu={onContextMenu}
                isOpen={openMenuId === customer.id}
                onToggleMenu={onToggleMenu}
                onEdit={onEdit}
                onOpenStatement={onOpenStatement}
                onArchiveToggle={onArchiveToggle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
