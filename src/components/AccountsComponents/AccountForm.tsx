import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { OutwardProps } from '@/types/inward.type';

interface AccountFormData {
  // material_details: string;
  material_details: number[];

  invoice_no: string;
  status: string;
  remarks: string;

  created_by?: string;
}

const AccountForm: React.FC<OutwardProps> = ({
  productId,
  companyName,
  materials,
  program_details,
  onBack,
  onSubmitSuccess,
}) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<AccountFormData>({
    // material_details: "",
    material_details: [],

    invoice_no: '',
    status: '',
    remarks: '',
  });

  const [programDate, setProgramDate] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const stored = localStorage.getItem('user');
  const parsedUser = stored ? JSON.parse(stored) : null;
  const user_name = parsedUser?.username;

  /* 🔹 Load Program Date when material changes */
  // useEffect(() => {
  //   const fetchProgramDate = async () => {
  //     if (!formData.material_details) return;

  //     try {
  //       const res = await fetch(
  //         `${API_URL}/api/get_programer_Details/?material_id=${formData.material_details}`
  //       );
  //       const data = await res.json();
  //       if (Array.isArray(data) && data.length > 0) {
  //         setProgramDate(data[0].program_date || '');
  //       }
  //     } catch (error) {
  //       console.error('⚠️ Failed to fetch program date', error);
  //     }
  //   };

  //   fetchProgramDate();
  // }, [formData.material_details, API_URL]);

  // ✅ Handle Input Changes + Realtime Validation

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    // ✅ Auto-update remarks based on status selection
    if (name === 'status') {
      if (value === 'open') {
        updated.remarks = `This Material is Processed on ${programDate || 'N/A'
          }`;
      } else if (value === 'closed') {
        updated.remarks = 'Bill Closed';
      }
    }

    // ✅ If user switches material and status is "open", refresh program date in remarks
    if (name === 'material_details' && formData.status === 'open') {
      updated.remarks = `This Material is Processed on ${programDate || 'N/A'}`;
    }

    setFormData(updated);
    validateField(name, value);
  };

  // ✅ Field-Level Validation
  //   const validateField = (name: string, value: string) => {
  //     let error = '';
  //     // if (name === "material_details" && !value.trim()) error = "Please select a material.";
  //     if (name === 'material_details' && formData.material_details.length === 0) {
  //       error = 'Please select at least one material.';
  //     }

  //     if (name === 'invoice_no' && !value.trim())
  //       error = 'Invoice number is required.';
  //     if (name === 'status' && !value.trim()) error = 'Please select a status.';
  //     if (name === 'remarks' && value.trim().length < 3)
  //       error = 'Remark must be at least 3 characters long.';

  //     setFormErrors((prev) => ({ ...prev, [name]: error }));
  //     return error;
  //   };

  const validateField = (name: string, value: any) => {
    let error = "";

    if (name === "material_details") {
      if (!value || value.length === 0) {
        error = "Please select at least one material.";
      }
    }

    if (name === "invoice_no" && (!value || !value.trim())) {
      error = "Invoice number is required.";
    }

    if (name === "status" && !value.trim()) {
      error = "Please select a status.";
    }

    if (name === "remarks" && value.trim().length < 3) {
      error = "Remark must be at least 3 characters long.";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };


  // ✅ Validate all fields before modal
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    Object.entries(formData).forEach(([key, value]) => {
      const err = validateField(key, value);
      if (err) hasError = true;
      newErrors[key] = err;
    });

    setFormErrors(newErrors);
    return !hasError;
  };

  // ✅ Handle open confirmation modal
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Validation Error ❌',
        description: 'Please fix highlighted fields before submitting.',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirm(true);
  };

  // ✅ Actual API Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // const payload: Record<string, any> = {
    //     product_details: productId,
    //     material_details: formData.material_details,
    //     // material_details: formData.material_details.join(","),

    //     invoice_no: formData.invoice_no,
    //     status: formData.status,
    //     remarks: formData.remarks,
    //     created_by: user_name,
    // };
    const payload = {
      product_details: productId,
      material_details: formData.material_details, // <-- important!
      invoice_no: formData.invoice_no,
      status: formData.status,
      remarks: formData.remarks,
      created_by: user_name,
    };

    try {
      const res = await fetch(`${API_URL}/api/add_acc_details/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.message || 'Failed to submit account details');

      toast({
        title: '✅ Account Details Submitted',
        description: 'Account entry successfully recorded.',
      });

      onSubmitSuccess?.();
      onBack();
    } catch (err) {
      toast({
        title: 'Error ❌',
        description:
          err.message || 'Something went wrong while submitting account data.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  // const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = Number(e.target.value);

  //   setFormData((prev) => {
  //     let updatedMaterials;

  //     if (prev.material_details.includes(value)) {
  //       // Remove if unchecked
  //       updatedMaterials = prev.material_details.filter((id) => id !== value);
  //     } else {
  //       // Add if checked
  //       updatedMaterials = [...prev.material_details, value];
  //     }

  //     return { ...prev, material_details: updatedMaterials };
  //   });

  //   // Validation
  //   setFormErrors((prev) => ({
  //     ...prev,
  //     material_details:
  //       prev.material_details?.length === 0
  //         ? 'Please select at least one material.'
  //         : '',
  //   }));
  // };

  // const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = Number(e.target.value);

  //   setFormData((prev) => {
  //     let updatedMaterials;

  //     if (prev.material_details.includes(value)) {
  //       updatedMaterials = prev.material_details.filter((id) => id !== value);
  //     } else {
  //       updatedMaterials = [...prev.material_details, value];
  //     }

  //     return {
  //       ...prev,
  //       material_details: updatedMaterials,
  //       remarks:
  //         prev.status === "open"
  //           ? `This Material is Processed on ${programDate || "N/A"}`
  //           : prev.remarks,
  //     };
  //   });
  // };


  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = Number(e.target.value);

    setFormData(prev => {
      const updated =
        prev.material_details.includes(id)
          ? prev.material_details.filter(x => x !== id)
          : [...prev.material_details, id];

      return {
        ...prev,
        material_details: updated,
        remarks:
          prev.status === "open"
            ? `This Material is Processed on ${program_details[id] || "N/A"}`
            : prev.remarks
      };
    });
  };


  return (
    <div className=' mx-auto mt-10 bg-white rounded-2xl p-6 sm:p-10 border shadow-md'>
      <form onSubmit={handleOpenConfirm} className='space-y-8'>
        {/* ✅ Material CheckBox */}
        <div className='flex flex-col space-y-1.5'>
          <label className='text-sm font-medium text-gray-700'>Material</label>

          <div className='border rounded-lg px-3 py-2 max-h-40 overflow-y-auto space-y-2'>
            {materials
              .filter((mat) => mat.acc_status === 'pending' && mat.programer_status === "completed")
              .map((mat) => (
                <label key={mat.id} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    name='material_details'
                    value={mat.id}
                    checked={formData.material_details.includes(mat.id)}
                    onChange={handleCheckboxChange}
                    className='h-4 w-4'
                  />
                  <span>
                    {mat.mat_type} ({mat.mat_grade}) — {mat.thick}mm ×{' '}
                    {mat.width} × {mat.length}
                  </span>
                </label>
              ))}
          </div>

          {formErrors.material_details && (
            <span className='text-red-500 text-xs'>
              {formErrors.material_details}
            </span>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Invoice Number */}
          <div className='flex flex-col space-y-1.5'>
            <label className='text-sm font-medium text-gray-700'>
              Invoice No.
            </label>
            <input
              type='text'
              name='invoice_no'
              value={formData.invoice_no}
              onChange={handleChange}
              placeholder='Enter invoice number'
              className={`border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${formErrors.invoice_no
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-500'
                }`}
            />
            {formErrors.invoice_no && (
              <span className='text-red-500 text-xs'>
                {formErrors.invoice_no}
              </span>
            )}
          </div>

          {/* Status */}
          <div className='flex flex-col space-y-1.5'>
            <label className='text-sm font-medium text-gray-700'>Status</label>
            <select
              name='status'
              value={formData.status}
              onChange={handleChange}
              className={`border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${formErrors.status
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-500'
                }`}
            >
              <option value=''>Select Status</option>
              <option value='open'>OPEN</option>
              <option value='closed'>CLOSED</option>
            </select>
            {formErrors.status && (
              <span className='text-red-500 text-xs'>{formErrors.status}</span>
            )}
          </div>

          {/* Remarks */}
          <div className='flex flex-col space-y-1.5 md:col-span-2'>
            <label className='text-sm font-medium text-gray-700'>Remarks</label>
            <textarea
              name='remarks'
              value={formData.remarks}
              onChange={handleChange}
              rows={4}
              placeholder='Add any remarks...'
              className={`border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${formErrors.remarks
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-500'
                }`}
            />
            {formErrors.remarks && (
              <span className='text-red-500 text-xs'>{formErrors.remarks}</span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className='flex flex-col sm:flex-row justify-center gap-4 mt-8'>
          <Button
            type='submit'
            className='bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl shadow-md transition-all w-full sm:w-auto'
          >
            Submit
          </Button>

          <Button
            type='button'
            onClick={onBack}
            className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl w-full sm:w-auto'
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* ✅ Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-semibold text-gray-800'>
              Confirm Submission
            </DialogTitle>
          </DialogHeader>
          <p className='text-gray-600 mt-2'>
            Are you sure you want to submit this Account form for{' '}
            <strong>{companyName}</strong>?
          </p>
          <DialogFooter className='mt-6 flex justify-end gap-3'>
            <Button variant='outline' onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='bg-green-700 hover:bg-green-800 text-white'
            >
              {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountForm;
