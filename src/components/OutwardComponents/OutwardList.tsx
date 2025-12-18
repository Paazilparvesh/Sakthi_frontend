import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OutwardProps } from '@/types/inward.type';
import { useLocation } from 'react-router-dom';
import { Eye } from "lucide-react";

export const OutwardList: React.FC<OutwardProps> = ({
  product,
  onView,
  getStatusColor,
}) => {
  const location = useLocation();
  const isAccountantPage = location.pathname
    .toLowerCase()
    .includes('accounts_dashboard');
  return (
    <div className='overflow-x-auto w-full'>
      <table className='w-full border-collapse text-sm sm:text-base'>
        <thead>
          <tr className='border-b bg-slate-100 text-center'>
            <th className='px-2 py-2 border w-[7%]'>Serial No.</th>
            <th className='px-2 py-2 border w-[7%]'>Slip No.</th>
            <th className='px-2 py-2 border w-[7%]'>Company Name</th>
            <th className='px-2 py-2 border w-[7%]'>Customer Name</th>
            <th className='px-2 py-2 border w-[7%]'>Date</th>
            <th className='px-2 py-2 border w-[7%]'>Color</th>
            <th className='px-2 py-2 border w-[7%]'>Created By</th>
            <th className='px-2 py-2 border w-[7%]'>
              {isAccountantPage ? 'QA Status' : 'Status'}
            </th>

            {isAccountantPage && <th className='px-2 py-2 border w-[7%]'>Status</th>}
            <th className='px-2 py-2 border w-[7%]'>Action</th>
          </tr>
        </thead>
        <tbody>
          {product.map((item, i) => (
            <tr
              key={i}
              className='hover:bg-slate-50 even:bg-gray-50 odd:bg-white transition-all border text-center text-sm'
            >
              <td className='px-4 py-1 border text-center'>
                {item.serial_number}
              </td>
              <td className='px-4 py-2 border'>{item.inward_slip_number}</td>
              <td className='px-4 py-2 border'>{item.company_name}</td>
              <td className='px-4 py-2 border'>{item.customer_name}</td>
              <td className='px-4 py-2 border text-center'>{item.date}</td>
              <td className='px-4 py-2 border text-center'>{item.color}</td>
              <td className='px-4 py-2 border text-center'>
                {item.created_by || 'Unknown'}
              </td>
              <td className='px-4 py-2 border text-center'>
                <Badge className={getStatusColor(item.qa_status)}>
                  {item.qa_status}
                </Badge>
              </td>
              {isAccountantPage && (
                <td className='px-4 py-2 border text-center'>
                  <Badge className={getStatusColor(item.outward_status)}>
                    {item.outward_status}
                  </Badge>
                </td>
              )}
              <td className='px-4 py-2 border text-center'>
                <button
                  className='bg-blue-800 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 mx-auto'
                  onClick={() => onView(item)}
                >
                  <Eye className="h-4 w-4" /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
