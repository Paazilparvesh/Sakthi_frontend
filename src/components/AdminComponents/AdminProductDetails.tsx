import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ProductType,
} from '@/types/inward.type';

/* ---------------------- Props ---------------------- */
interface AdminProductDetailProps {
  product: ProductType;
  onBack: () => void;
  onEdit: (product: ProductType) => void;
}

/*  Helper Function  */
const renderFieldCard = (
  label: string,
  value: string | number | null | undefined,
  isStatus?: boolean
) => {
  const displayValue = value !== null && value !== undefined ? value : '-';

  const statusColor =
    typeof value === 'string' && isStatus
      ? value.toLowerCase() === 'pending'
        ? 'w-24 rounded-full px-3 text-yellow-600 bg-yellow-100 border-yellow-300'
        : 'w-28 rounded-full px-3 text-green-600 bg-green-100 border-green-300'
      : 'text-gray-800';

  return (
    <Card
      className={`shadow-sm rounded-lg border ${
        isStatus ? 'border-transparent' : 'border-gray-200'
      }`}
    >
      <CardContent className='p-4'>
        <span className='text-gray-500 font-medium text-sm'>{label}</span>
        <p
          className={`font-semibold text-base md:text-lg mt-1 block py-1 ${statusColor}`}
        >
          {displayValue || '-'}
        </p>
      </CardContent>
    </Card>
  );
};

/*  Main Component  */
const AdminProductDetail: React.FC<AdminProductDetailProps> = ({
  product,
  onBack,
  onEdit,
}) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    null
  );

  const isOutwardCompleted =
    product.outward_status?.toLowerCase() === 'completed';

  return (
    <Card className='p-0 border-0 mx-auto w-full'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <h2 className='text-2xl sm:text-3xl font-bold text-gray-800'>
          Admin Product Details
        </h2>
        <div className='flex justify-center items-center gap-3'>
          {!isOutwardCompleted && (
            <Button
              className='bg-blue-600 text-white hover:bg-blue-700'
              onClick={() => onEdit(product)}
            >
              Edit
            </Button>
          )}
          <Button
            className='bg-gray-200 text-black hover:bg-gray-300'
            onClick={onBack}
          >
            Back to Table
          </Button>
        </div>
      </div>

      {/* Inward Details */}
      <section className='space-y-4 mt-10'>
        <div className='overflow-x-auto rounded-xl border border-gray-300 shadow-sm'>
          <table className='w-full border-collapse text-center text-sm sm:text-base rounded-xl overflow-hidden'>
            <thead className='bg-gray-100 text-gray-700 font-semibold'>
              <tr>
                <th className='border px-1 py-1'>Serial No.</th>
                <th className='border px-1 py-1'>Date</th>
                <th className='border px-1 py-1'>Inward Slip No.</th>
                <th className='border px-1 py-1'>WO. No.</th>
                <th className='border px-1 py-1'>Company Name</th>
                <th className='border px-1 py-1'>Customer Name</th>
                <th className='border px-1 py-1'>Contact No.</th>
                <th className='border px-1 py-1'>Customer Dc No.</th>
                <th className='border px-1 py-1'>Color</th>
                <th className='border px-1 py-1'>Created By</th>
              </tr>
            </thead>
            <tbody>
              <>
                <tr className='hover:bg-gray-50 transition-colors text-gray-800'>
                  <td className='border px-2 py-2 font-medium'>
                    {product.serial_number}
                  </td>
                  <td className='border px-2 py-2'>{product.date}</td>
                  <td className='border px-2 py-2'>
                    {product.inward_slip_number}
                  </td>
                  <td className='border px-2 py-2'>
                    {product.worker_no || '—'}
                  </td>
                  <td className='border px-2 py-2'>{product.company_name}</td>
                  <td className='border px-2 py-2'>{product.customer_name}</td>
                  <td className='border px-2 py-2'>{product.contact_no}</td>
                  <td className='border px-2 py-2'>{product.customer_dc_no}</td>
                  <td className='border px-2 py-2'>{product.color}</td>
                  <td className='border px-2 py-2'>{product.created_by}</td>
                </tr>
              </>
            </tbody>
          </table>
        </div>
      </section>

      {/* Materials Table */}
      {product.materials?.length > 0 && (
        <section className='mt-10 space-y-4'>
          <h3 className='text-xl font-semibold text-gray-700'>
            Product Materials
          </h3>
          <div className='overflow-x-auto rounded-xl border border-gray-300 shadow-sm'>
            <table className='w-full border-collapse text-center text-sm sm:text-base rounded-xl overflow-hidden'>
              <thead className='bg-gray-100 text-gray-700 font-semibold'>
                <tr>
                  <th className='border px-1 py-1'>S.No</th>
                  <th className='border px-1 py-1'>Bay</th>
                  <th className='border px-1 py-1'>Material Type</th>
                  <th className='border px-1 py-1'>Material Grade</th>
                  <th className='border px-1 py-1'>Thick (mm)</th>
                  <th className='border px-1 py-1'>Width (mm)</th>
                  <th className='border px-1 py-1'>Length (mm)</th>
                  <th className='border px-1 py-1'>Density</th>
                  <th className='border px-1 py-1'>Unit Weight (kg)</th>
                  <th className='border px-1 py-1'>Quantity</th>
                  <th className='border px-1 py-1'>Total Weight (kg)</th>
                  <th className='border px-1 py-1'>Stock Due (Days)</th>
                  <th className='border px-1 py-1'>Remarks</th>
                  <th className='border px-2 py-2'>Action</th>
                </tr>
              </thead>
              <tbody>
                {product.materials.map((mat, index) => (
                  <React.Fragment key={index}>
                    <tr className='hover:bg-gray-50 transition-colors text-gray-800'>
                      <td className='border px-2 py-2 font-medium'>
                        {index + 1}
                      </td>
                      <td className='border px-2 py-2'>{mat.bay || '-'}</td>
                      <td className='border px-2 py-2'>
                        {mat.mat_type || '-'}
                      </td>
                      <td className='border px-2 py-2'>
                        {mat.mat_grade || '-'}
                      </td>
                      <td className='border px-2 py-2'>{mat.thick ?? '-'}</td>
                      <td className='border px-2 py-2'>{mat.width ?? '-'}</td>
                      <td className='border px-2 py-2'>{mat.length ?? '-'}</td>
                      <td className='border px-2 py-2'>{mat.density ?? '-'}</td>
                      <td className='border px-2 py-2'>
                        {Number(mat.unit_weight).toFixed(2)}
                      </td>
                      <td className='border px-2 py-2'>
                        {mat.quantity ?? '-'}
                      </td>
                      <td className='border px-2 py-2'>
                        {Number(mat.total_weight).toFixed(2)}
                      </td>
                      <td className='border px-2 py-2'>
                        {mat.stock_due ?? '-'}
                      </td>
                      <td className='border px-2 py-2'>{mat.remarks || '—'}</td>
                      <td className='border px-2 py-2'>
                        <Button
                          onClick={() =>
                            setSelectedMaterialId(
                              selectedMaterialId === mat.id ? null : mat.id
                            )
                          }
                          className='bg-blue-700 hover:bg-blue-600'
                        >
                          {selectedMaterialId === mat.id ? 'Hide' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Material Details Sections */}
      {selectedMaterialId &&
        product.materials
          .filter((mat) => mat.id === selectedMaterialId)
          .map((mat) => (
            <React.Fragment key={mat.id}>
              {/* Programmer Details */}
              <section className='mb-10'>
                <h4 className='text-lg font-semibold text-gray-700 mb-3'>
                  Programmer Details
                </h4>

                {Array.isArray(mat.programer_details) &&
                mat.programer_details.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                    {mat.programer_details.map((prog) =>
                      Object.entries(prog).map(([key, value]) => {
                        if (
                          [
                            'id',
                            'product_details',
                            'material_details',
                          ].includes(key)
                        )
                          return null;

                        const safeValue =
                          typeof value === 'object' && value !== null
                            ? JSON.stringify(value)
                            : value;

                        return (
                          <React.Fragment key={key}>
                            {renderFieldCard(
                              key
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase()),
                              safeValue
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <p className='text-gray-500 italic'>
                    No programmer details available.
                  </p>
                )}
              </section>

              {/* QA Details */}
              <section className='mb-10'>
                <h4 className='text-lg font-semibold text-gray-700 mb-3'>
                  QA Details
                </h4>

                {Array.isArray(mat.qa_details) && mat.qa_details.length > 0 ? (
                  <>
                    <table className='w-full border-collapse text-sm text-center rounded-xl overflow-hidden border'>
                      <thead className='bg-gray-100 text-gray-700 font-semibold'>
                        <tr>
                          <th className='border px-2 py-1'>Processed Date</th>
                          <th className='border px-2 py-1'>Shift</th>
                          <th className='border px-2 py-1'>Sheets</th>
                          <th className='border px-2 py-1'>Cycle/Sheet</th>
                          <th className='border px-2 py-1'>Total Cycle</th>
                          <th className='border px-2 py-1'>Created By</th>
                        </tr>
                      </thead>

                      <tbody>
                        {mat.qa_details.map((qa, i) => (
                          <React.Fragment key={i}>
                            {/* QA Main Row */}
                            <tr>
                              <td className='border px-2 py-2'>
                                {qa.processed_date}
                              </td>
                              <td className='border px-2 py-2'>{qa.shift}</td>
                              <td className='border px-2 py-2'>
                                {qa.no_of_sheets}
                              </td>
                              <td className='border px-2 py-2'>
                                {qa.cycletime_per_sheet}
                              </td>
                              <td className='border px-2 py-2'>
                                {qa.total_cycle_time}
                              </td>
                              <td className='border px-2 py-2'>
                                {qa.created_by__username}
                              </td>
                            </tr>

                            {/* Machines Row (Full Width) */}
                            <tr>
                              <td
                                colSpan={6}
                                className='border px-2 py-2 bg-gray-50'
                              >
                                {/* {qa.machines_used.length > 0 ? ( */}
                                {Array.isArray(qa.machines_used) &&
                                qa.machines_used.length > 0 ? (
                                  <table className='w-full border-collapse text-sm'>
                                    <thead>
                                      <tr className='bg-slate-200 text-center'>
                                        <th className='px-2 py-2 border'>
                                          Machine
                                        </th>
                                        <th className='px-2 py-2 border'>
                                          Date
                                        </th>
                                        <th className='px-2 py-2 border'>
                                          Start
                                        </th>
                                        <th className='px-2 py-2 border'>
                                          End
                                        </th>
                                        <th className='px-2 py-2 border'>
                                          Runtime
                                        </th>
                                        <th className='px-2 py-2 border'>
                                          Operator
                                        </th>
                                        <th className='px-2 py-2 border'>
                                          Air
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {qa.machines_used.map((m, idx) => (
                                        <tr key={idx}>
                                          <td className='border px-2 py-1'>
                                            {m.machine}
                                          </td>
                                          <td className='border px-2 py-1'>
                                            {m.date}
                                          </td>
                                          <td className='border px-2 py-1'>
                                            {m.start}
                                          </td>
                                          <td className='border px-2 py-1'>
                                            {m.end}
                                          </td>
                                          <td className='border px-2 py-1'>
                                            {m.runtime}
                                          </td>
                                          <td className='border px-2 py-1'>
                                            {m.operator}
                                          </td>
                                          <td className='border px-2 py-1'>
                                            {m.air || '—'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <span className='italic text-gray-500'>
                                    No Machines
                                  </span>
                                )}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className='text-gray-500 italic'>
                    No QA details available.
                  </p>
                )}
              </section>

              {/* Account Details */}
              <section>
                <h4 className='text-lg font-semibold text-gray-700 mb-3'>
                  Account Details
                </h4>

                {Array.isArray(mat.account_details) &&
                mat.account_details.length > 0 ? (
                  <table className='min-w-full border text-sm'>
                    <thead className='bg-gray-100 text-gray-700'>
                      <tr>
                        <th className='border px-4 py-2'>Invoice No</th>
                        <th className='border px-4 py-2'>Status</th>
                        <th className='border px-4 py-2'>Remarks</th>
                        <th className='border px-4 py-2'>Created By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mat.account_details.map((acc, i) => (
                        <tr key={i}>
                          <td className='border px-4 py-2'>{acc.invoice_no}</td>
                          <td className='border px-4 py-2'>{acc.status}</td>
                          <td className='border px-4 py-2'>{acc.remarks}</td>
                          <td className='border px-4 py-2'>
                            {acc.created_by__username}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className='text-gray-500 italic'>
                    No account details available.
                  </p>
                )}
              </section>
            </React.Fragment>
          ))}
    </Card>
  );
};

export default AdminProductDetail;
