import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ProductType } from '@/types/inward.type';
import { useToast } from '@/components/ui/use-toast';

/* ---------------------- Interfaces ---------------------- */
interface ProgramerDetail {
  id: number;
  created_by: string;
  program_no: string;
  program_date: string;
  processed_quantity: number;
  balance_quantity: number;
  used_weight: number;
  number_of_sheets: number;
  cut_length_per_sheet: number;
  pierce_per_sheet: number;
  processed_mins_per_sheet: number;
  total_planned_hours: number;
  total_meters: number;
  total_piercing: number;
  total_used_weight: number;
  total_no_of_sheets: number;
  product_details: number;
  material_details: number | null;
}

interface QaDetail {
  id: number;
  processed_date: string;
  shift: string;
  no_of_sheets: number;
  cycletime_per_sheet: number;
  total_cycle_time: number;
  machines_used: {
    machine: string;
    date: string;
    start: string;
    end: string;
    runtime: string;
    air: string;
    operator: string;
  }[];
  product_id: number;
  material_id: number;
  created_by: string;
}

interface AccDetail {
  acc_detail_id: number;
  product_id: number;
  material_id: number;
  invoice_no: string;
  status: string;
  remarks: string;
  created_by: string;
}

interface OutwardDetailProps {
  product: ProductType;
  program?: ProgramerDetail[];
  getStatusColor: (status: string) => string;
}

/* ---------------------- Helper Components ---------------------- */
const renderFieldCard = (
  label: string,
  value: string | number,
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

/* ---------------------- Main Component ---------------------- */
const OutwardDetail: React.FC<OutwardDetailProps> = ({ product }) => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const { toast } = useToast();
  // 🔹 States
  const [qa, setQa] = useState<QaDetail[]>([]);
  const [acc, setAcc] = useState<AccDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingID, setLoadingID] = useState<number | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    null
  );
  const [materialDataMap, setMaterialDataMap] = useState<
    Record<number, ProgramerDetail>
  >({});

  /* ---------------------- Fetch QA + Account ---------------------- */
  const fetchQaAcc = useCallback(async () => {
    try {
      setLoading(true);
      const [qaRes, accRes] = await Promise.all([
        fetch(`${BASE_URL}/api/get_qa_details/`),
        fetch(`${BASE_URL}/api/get_acc_details/`),
      ]);
      if (!qaRes.ok || !accRes.ok) throw new Error('Failed to fetch data');

      const qaData: QaDetail[] = await qaRes.json();
      const accData: AccDetail[] = await accRes.json();

      setQa(qaData.reverse());
      setAcc(accData.reverse());
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Fetch Error',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, toast]);

  useEffect(() => {
    fetchQaAcc();
  }, [fetchQaAcc]);

  /* ---------------------- Fetch Programmer Data ---------------------- */
  const handleViewProgram = async (materialId: number) => {
    if (selectedMaterialId === materialId) {
      setSelectedMaterialId(null);
      return;
    }

    // Cached result
    if (materialDataMap[materialId]) {
      setSelectedMaterialId(materialId);
      return;
    }

    try {
      setLoadingID(materialId);
      const url = `${BASE_URL}/api/get_programer_Details/?product_id=${product.id}&material_id=${materialId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || 'Failed to fetch programmer details');

      if (Array.isArray(data) && data.length > 0) {
        const matched = data[0];
        setMaterialDataMap((prev) => ({ ...prev, [materialId]: matched }));
        setSelectedMaterialId(materialId);
      } else {
        toast({
          title: 'No record found',
          description: `No programmer data linked to this material.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching programmer details:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Unexpected error occurred while fetching data',
        variant: 'destructive',
      });
    } finally {
      setLoadingID(null);
    }
  };

  const selectedMaterialQaDetails = useMemo(
    () =>
      qa.filter(
        (q) =>
          q.product_id === product.id && q.material_id === selectedMaterialId
      ),
    [qa, product.id, selectedMaterialId]
  );

  const selectedMaterialAccDetails = useMemo(
    () =>
      acc.filter(
        (a) =>
          a.product_id === product.id && a.material_id === selectedMaterialId
      ),
    [acc, product.id, selectedMaterialId]
  );

  /* ---------------------- JSX ---------------------- */
  return (
    <Card className='p-4 sm:p-6 md:p-8 mx-auto w-full'>
      {/* Product Info */}
      <section className='space-y-4'>
        <h3 className='text-xl font-semibold text-gray-700'>Inward Details</h3>
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
        <section className='space-y-4 mt-10'>
          <h3 className='text-xl font-semibold text-gray-700'>
            Product Materials
          </h3>
          <div className='overflow-x-auto rounded-xl border border-gray-300 shadow-sm'>
            <table className='w-full border-collapse text-center text-sm sm:text-base rounded-xl overflow-hidden'>
              <thead className='bg-gray-100 text-gray-700 font-semibold w-full'>
                <tr>
                  <th className='border px-1 py-1'>S.No</th>
                  <th className='border px-1 py-1'>Bay</th>
                  <th className='border px-1 py-1'>Material Type</th>
                  <th className='border px-1 py-1'>Grade</th>
                  <th className='border px-1 py-1'>Thick (mm)</th>
                  <th className='border px-1 py-1'>Width (mm)</th>
                  <th className='border px-1 py-1'>Length (mm)</th>
                  <th className='border px-1 py-1'>Density</th>
                  <th className='border px-1 py-1'>Unit Weight (kg)</th>
                  <th className='border px-1 py-1'>Quantity</th>
                  <th className='border px-1 py-1'>Total Weight (kg)</th>
                  <th className='border px-1 py-1'>Stock Due (Days)</th>
                  <th className='border px-1 py-1'>Remarks</th>
                  {product.materials.some(
                    (mat) => mat.programer_status === 'completed'
                  ) && <th className='border px-2 py-2'>Action</th>}
                </tr>
              </thead>
              <tbody>
                {product.materials.map((mat, index) => (
                  <tr
                    key={mat.id || index}
                    className='hover:bg-gray-50 transition text-gray-800'
                  >
                    <td className='border px-2 py-2 font-medium'>
                      {index + 1}
                    </td>
                    <td className='border px-2 py-2'>{mat.bay}</td>
                    <td className='border px-2 py-2'>{mat.mat_type}</td>
                    <td className='border px-2 py-2'>{mat.mat_grade}</td>
                    <td className='border px-2 py-2'>{mat.thick}</td>
                    <td className='border px-2 py-2'>{mat.width}</td>
                    <td className='border px-2 py-2'>{mat.length}</td>
                    <td className='border px-2 py-2'>{mat.density}</td>
                    <td className='border px-2 py-2'>
                      {Number(mat.unit_weight).toFixed(2)}
                    </td>
                    <td className='border px-2 py-2'>{mat.quantity}</td>
                    <td className='border px-2 py-2'>
                      {Number(mat.total_weight).toFixed(2)}
                    </td>
                    <td className='border px-2 py-2'>{mat.stock_due}</td>
                    <td className='border px-2 py-2'>{mat.remarks || '--'}</td>
                    {mat.programer_status === 'completed' && mat.id && (
                      <td className='border px-2 py-2'>
                        <Button
                          onClick={() => handleViewProgram(mat.id!)}
                          disabled={loadingID === mat.id}
                          className='bg-blue-700 hover:bg-blue-800'
                        >
                          {loadingID === mat.id
                            ? 'Loading...'
                            : selectedMaterialId === mat.id
                            ? 'Hide'
                            : 'View'}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Programmer Details */}
      <section className='mt-10'>
        <h3 className='text-2xl font-semibold text-gray-800 mb-6'>
          Programmer Details
        </h3>
        {selectedMaterialId && materialDataMap[selectedMaterialId] ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            {Object.entries(materialDataMap[selectedMaterialId]).map(
              ([key, value]) => {
                if (['id', 'product_details', 'material_details'].includes(key))
                  return null;
                return (
                  <React.Fragment key={key}>
                    {renderFieldCard(
                      key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase()),
                      value !== null && value !== undefined ? value : '-' // ✅ Keep 0, show "-" only if null/undefined
                    )}
                  </React.Fragment>
                );
              }
            )}
          </div>
        ) : (
          <p className='text-gray-500 italic text-center py-8'>
            {loadingID
              ? 'Fetching programmer details...'
              : "Click 'View' to see programmer details for a material."}
          </p>
        )}
      </section>

      {/* QA Section (filtered per material) */}
      {selectedMaterialId && selectedMaterialQaDetails.length > 0 ? (
        <>
          <section className='mt-10'>
            <h3 className='text-xl font-semibold text-gray-700 mb-6'>
              QA Details (Material #{selectedMaterialId})
            </h3>
            <div className='overflow-x-auto rounded-xl border border-gray-300 shadow-sm'>
              <table className='w-full border-collapse text-center text-sm sm:text-base rounded-xl overflow-hidden'>
                <thead className='bg-gray-100 text-gray-700 font-semibold'>
                  <tr>
                    <th className='border px-2 py-1'>Processed Date</th>
                    <th className='border px-2 py-1'>Shift</th>
                    <th className='border px-2 py-1'>No. of Sheets</th>
                    <th className='border px-2 py-1'>Cycle Time/Sheet</th>
                    <th className='border px-2 py-1'>Total Cycle Time</th>
                    <th className='border px-2 py-1'>Created By</th>
                    {/* <th className='border px-2 py-1 w-full'>Machines Used / Time</th> */}
                  </tr>
                </thead>

                <tbody>
                  {selectedMaterialQaDetails.map((qa) => (
                    <tr
                      key={qa.id}
                      className='hover:bg-gray-50 transition-colors text-gray-800'
                    >
                      <td className='border px-2 py-2'>{qa.processed_date}</td>
                      <td className='border px-2 py-2'>{qa.shift}</td>
                      <td className='border px-2 py-2'>{qa.no_of_sheets}</td>
                      <td className='border px-2 py-2'>
                        {qa.cycletime_per_sheet}
                      </td>
                      <td className='border px-2 py-2'>
                        {qa.total_cycle_time}
                      </td>
                      <td className='border px-2 py-2'>{qa.created_by}</td>

                      {/* Machines used */}
                      {/* <td className='border px-2 py-2'>
                        {qa.machines_used?.length > 0 ? (
                          <ul className='space-y-1 text-left'>
                            {qa.machines_used.map((m, idx) => (
                              <li
                                key={idx}
                                className='flex justify-between bg-gray-100 px-2 py-1 rounded'
                              >
                                <span className='font-medium'>{m.machine}</span>
                                <span className='border'>{m.date} date</span>
                                <span className='border'>{m.start}start</span>
                                <span className='border'>{m.end}end</span>
                                <span className='border'>{m.runtime}Runtime</span>
                                <span className='border'>{m.air}Air</span>
                                <span className='border'>{m.operator}Operator</span>
                             
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className='italic text-gray-500'>
                            No machines
                          </span>
                        )}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <tbody>
            {selectedMaterialQaDetails.map((qa) => (
              <React.Fragment key={qa.id}>
                <tr className='hover:bg-gray-50 text-gray-800 w-full'>
                 
                  <td className='border px-2 py-2 w-full'>
                    {qa.machines_used.length > 0 ? (
                      <table className='w-full border-collapse text-sm'>
                        <thead>
                          <tr className='bg-slate-100 text-center'>
                            <th className='px-2 py-2'>Machine</th>
                            <th className='px-2 py-2'>Date</th>
                            <th className='px-2 py-2'>Start</th>
                            <th className='px-2 py-2'>End</th>
                            <th className='px-2 py-2'>Runtime</th>
                            <th className='px-2 py-2'>Operator</th>
                            <th className='px-2 py-2'>Air</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qa.machines_used.map((m, idx) => (
                            <tr key={idx}>
                              <td className='border px-16'>{m.machine}</td>
                              <td className='border px-16'>{m.date}</td>
                              <td className='border px-16'>{m.start}</td>
                              <td className='border px-16'>{m.end}</td>
                              <td className='border px-16'>{m.runtime}</td>
                              <td className='border px-16'>{m.operator}</td>
                              <td className='border px-16'>{m.air || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <span className='text-gray-500 italic'>No Machines</span>
                    )}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </>
      ) : (
        selectedMaterialId && (
          <p className='text-gray-500 italic text-center mt-6'>
            No QA details found for this material.
          </p>
        )
      )}

      {selectedMaterialId && selectedMaterialAccDetails.length > 0 ? (
        <>
          <Separator className='my-10' />

          <h3 className='text-xl font-semibold text-gray-700 mb-6'>
            Account Details
          </h3>

          <div className='overflow-x-auto rounded-xl border'>
            <table className='min-w-full border-collapse text-sm'>
              <thead>
                <tr className='bg-gray-100 text-left text-gray-700'>
                  <th className='px-4 py-3 border'>Invoice No</th>
                  <th className='px-4 py-3 border'>Status</th>
                  <th className='px-4 py-3 border'>Remarks</th>
                  <th className='px-4 py-3 border'>Created By</th>
                </tr>
              </thead>

              <tbody>
                {selectedMaterialAccDetails.map((acc) => (
                  <tr key={acc.acc_detail_id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 border'>{acc.invoice_no}</td>
                    <td className='px-4 py-3 border'>{acc.status}</td>
                    <td className='px-4 py-3 border'>{acc.remarks}</td>
                    <td className='px-4 py-3 border'>{acc.created_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        selectedMaterialId && (
          <p className='text-gray-500 italic text-center mt-6'>
            No Account details found for this material.
          </p>
        )
      )}
    </Card>
  );
};

export default OutwardDetail;
