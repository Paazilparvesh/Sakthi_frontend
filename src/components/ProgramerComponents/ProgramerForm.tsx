import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StepProgressBar } from '@/components/ReusableComponents/StepProgressBar';
import { toast } from '@/hooks/use-toast';
import { ProductType, Material } from '@/types/inward.type';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface ProgramerFormData {
  product_details: number | string;
  material_details: number | string;
  program_no: string;
  program_date: string;
  processed_quantity: string;
  balance_quantity: string;
  processed_width?: string;
  processed_length?: string;
  used_weight: string;
  number_of_sheets: string;
  cut_length_per_sheet: string;
  pierce_per_sheet: string;
  processed_mins_per_sheet: string;
  total_planned_hours: string;
  total_meters: string;
  total_piercing: string;
  total_used_weight: string;
  total_no_of_sheets: string;
  remarks?: string;
  created_by?: string;
}

interface ProgramerFormWrapperProps {
  item: ProductType;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onBack?: () => void;
  onSuccess?: () => void;
}


const ProgramerFormWrapper: React.FC<ProgramerFormWrapperProps> = ({
  item,
  currentStep,
  setCurrentStep,
  onBack,
  onSuccess,
}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const totalSteps = 2;
  const materials: Material[] = item.materials || [];
  const userName = localStorage.getItem('username');

  const allowOnlyNumbers = (value: string) =>
    /^(\d+(\.\d*)?|\.\d+)?$/.test(value);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMaterialQty, setSelectedMaterialQty] = useState<number>(0);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProgramerFormData>({
    product_details: item.id,
    material_details: '',
    program_no: '',
    program_date: '',
    processed_quantity: '',
    balance_quantity: '',
    processed_width: '',
    processed_length: '',
    used_weight: '',
    number_of_sheets: '',
    cut_length_per_sheet: '',
    pierce_per_sheet: '',
    processed_mins_per_sheet: '',
    total_planned_hours: '',
    total_meters: '',
    total_piercing: '',
    total_used_weight: '',
    total_no_of_sheets: '',
    remarks: '',
    created_by: '',
  });

  const [remainingMaterial, setRemainingMaterial] = useState<{
    width: string;
    length: string;
    original_width: number;
    original_length: number;
  }>({
    width: '',
    length: '',
    original_width: 0,
    original_length: 0,
  });

  // keep product ID synced if `item` changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, product_details: item.id }));
  }, [item]);

  // Auto-fill today's date
  useEffect(() => {
    if (!formData.program_date) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
      setFormData((prev) => ({ ...prev, program_date: formattedDate }));
    }
  }, [formData.program_date]);

  useEffect(() => {
    if (!userName) return;

    // If already generated for this form, don’t regenerate again
    if (formData.program_no) return;

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const initials = userName.substring(0, 2).toUpperCase();

    const lastNumber = parseInt(
      localStorage.getItem('lastProgramNo') || '0',
      10
    );
    const nextNumber = lastNumber + 1;

    const formattedNumber = nextNumber.toString().padStart(3, '0');
    const generatedProgramNo = `${year}${month}${initials}-${formattedNumber}`;

    // Save new number so next time it increments
    localStorage.setItem('lastProgramNo', nextNumber.toString());

    // Set into form once
    setFormData((prev) => ({
      ...prev,
      program_no: generatedProgramNo,
    }));
  }, [userName, formData.program_no]); // <-- empty dependency so it runs only once

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...recalculateTotals(prev) }));
  }, [
    formData.number_of_sheets,
    formData.processed_quantity,
    formData.pierce_per_sheet,
    formData.used_weight,
    formData.processed_mins_per_sheet,
    formData.cut_length_per_sheet,
  ]);

  // Auto-select material if only one is available
useEffect(() => {
  const pendingMats = materials.filter(
    (mat) => mat.programer_status === "pending"
  );

  if (pendingMats.length === 1) {
    const single = pendingMats[0];

    setFormData((prev) => ({
      ...prev,
      material_details: single.id.toString(),
      processed_quantity: "",
      balance_quantity: single.quantity.toString(),
    }));

    setSelectedMaterialQty(Number(single.quantity));

    // Set remaining material dimensions
    setRemainingMaterial({
      width: single.width?.toString() || "",
      length: single.length?.toString() || "",
      original_width: Number(single.width) || 0,
      original_length: Number(single.length) || 0,
    });
  }
}, [materials]);


  const recalculateTotals = (data: ProgramerFormData) => {
    const num = (v: string) => Number(v) || 0;

    const round3 = (num: number) => Number(num.toFixed(3));

    const processedQty = num(data.processed_quantity);
    const minsPerSheet = num(data.processed_mins_per_sheet);
    const cutLength = num(data.cut_length_per_sheet);

    // Total minutes
    const totalMinutes = Math.round(processedQty * minsPerSheet);

    // Convert minutes → HH:MM
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalPlannedHours = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}`;

    const totalMeters = round3(
      processedQty < 1 ? cutLength : processedQty * cutLength
    );
    const totalPiercing = round3(processedQty * num(data.pierce_per_sheet));
    const totalWeight = round3(processedQty * num(data.used_weight));
    const totalSheet = round3(processedQty * num(data.number_of_sheets));

    return {
      total_piercing: totalPiercing.toString(),
      total_used_weight: totalWeight.toString(),
      total_planned_hours: totalPlannedHours,
      total_meters: totalMeters.toString(),
      total_no_of_sheets: totalSheet.toString(),
    };
  };

  const handleValidateAll = () => {
    const fieldsToCheck = Object.keys(formData).filter(
      (k) => !['product_details', 'created_by', 'remarks'].includes(k)
    );

    let hasError = false;
    fieldsToCheck.forEach((key) => {
      const error = validateField(
        key,
        String(formData[key as keyof ProgramerFormData])
      );
      if (error) hasError = true;
    });

    if (hasError) {
      toast({
        title: 'Please fix highlighted fields',
        description: 'Some inputs are missing or invalid.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const validateField = (name: string, value: string) => {
    let error = '';

    if (!value.trim()) {
      error = `${LABELS[name as keyof ProgramerFormData]} is required.`;
    } else if (
      [
        'processed_quantity',
        'balance_quantity',
        'used_weight',
        'number_of_sheets',
        'cut_length_per_sheet',
        'pierce_per_sheet',
        'processed_mins_per_sheet',
        'total_meters',
        'total_piercing',
        'total_used_weight',
        'total_no_of_sheets',
      ].includes(name) &&
      isNaN(Number(value))
    ) {
      error = `${LABELS[name as keyof ProgramerFormData]} must be a number.`;
    }

    if (
      (name === 'processed_width' || name === 'processed_length') &&
      Number(formData.balance_quantity) === 0
    ) {
      return ''; // skip validation
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleNext = () => {
    let hasError = false;

    // ✅ Step 1 validation
    if (currentStep === 1) {
      // Check if material is selected
      if (!formData.material_details) {
        setFormErrors((prev) => ({
          ...prev,
          material_details: 'Please select a material before proceeding.',
        }));
        hasError = true;
      }

      // Validate Program No and Date
      ['program_no', 'program_date'].forEach((key) => {
        const error = validateField(
          key,
          String(formData[key as keyof ProgramerFormData])
        );
        if (error) hasError = true;
      });
    }

    // ✅ Step 2 validation
    else {
      const fieldsToCheck = Object.keys(formData).filter(
        (k) =>
          ![
            'program_no',
            'program_date',
            'product_details',
            'created_by',
            'material_details',
          ].includes(k)
      );

      fieldsToCheck.forEach((key) => {
        const error = validateField(
          key,
          String(formData[key as keyof ProgramerFormData])
        );
        if (error) hasError = true;
      });
    }

    // ✅ Show toast if validation failed
    if (hasError) {
      toast({
        title: 'Missing required fields',
        description:
          'Please select a material and fill all required inputs before continuing.',
        variant: 'destructive',
      });
      return;
    }

    // ✅ If all good, go to next step
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBack?.(); // Go back to dashboard
    } else {
      setCurrentStep((prev) => prev - 1); // Go to previous step
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // 🔹 Numeric fields (auto-block invalid input)
    const numericFields = [
      'processed_quantity',
      'used_weight',
      'number_of_sheets',
      'cut_length_per_sheet',
      'pierce_per_sheet',
      'processed_mins_per_sheet',
    ];

    // Block decimal ONLY for minutes field
    if (name === 'processed_mins_per_sheet') {
      if (!/^[0-9]*$/.test(value)) return; // no decimals allowed
    }

    if (numericFields.includes(name)) {
      if (!allowOnlyNumbers(value)) return; // ❌ block invalid
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // 🔹 When material changes → reset quantities
      if (name === 'material_details') {
        const selectedMat = materials.find((m) => m.id === Number(value));
        const qty = Number(selectedMat?.quantity) || 0;
        setSelectedMaterialQty(qty);

        updated.processed_quantity = '';
        updated.balance_quantity = qty.toString();

        // ✅ Pre-fill remaining material dimensions
        if (selectedMat) {
          setRemainingMaterial({
            width: selectedMat.width?.toString() || '',
            length: selectedMat.length?.toString() || '',
            original_width: Number(selectedMat.width) || 0,
            original_length: Number(selectedMat.length) || 0,
          });
        }
      }

      // 🔹 Auto-update balance
      if (name === 'processed_quantity') {
        const processed = Number(value) || 0;
        const round3 = (processed: number) => Number(processed.toFixed(3));
        const selectedMat = materials.find(m => m.id === Number(formData.material_details));
        const availableQty = Number(selectedMat?.quantity) || 0;
        let balance = round3(availableQty - processed);

        if (balance < 0) balance = 0; // prevent negative

        updated.balance_quantity = balance.toString();
      }

      // 🔹 Width auto-calc
      if (name === 'processed_width') {
        const processedW = Number(value) || 0;
        const remainingW = (remainingMaterial.original_width || 0) - processedW;

        setRemainingMaterial((prev) => ({
          ...prev,
          width: remainingW < 0 ? '0' : remainingW.toString(),
        }));
      }

      // 🔹 Length auto-calc
      if (name === 'processed_length') {
        const processedL = Number(value) || 0;
        const remainingL =
          (remainingMaterial.original_length || 0) - processedL;

        setRemainingMaterial((prev) => ({
          ...prev,
          length: remainingL < 0 ? '0' : remainingL.toString(),
        }));
      }

      return updated;
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async () => {
    setConfirmOpen(false);
    const stored = localStorage.getItem('user');
    const parsedUser = stored ? JSON.parse(stored) : null;
    const created_by = parsedUser?.username || 'Unknown';
    if (!created_by) {
      toast({
        title: 'Error',
        description: 'User not logged in.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.product_details) {
      toast({
        title: 'Error',
        description: 'Product ID is missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const balanceQty = formData.balance_quantity;

      const selectedMaterialId = formData.material_details;

      // ------------------------------------------------------
      // 1️⃣ ONLY CREATE UPDATED MATERIAL IF BALANCE > 0
      // ------------------------------------------------------
      if (Number(balanceQty) > 0) {
        const materialPayload = {
          product_details: formData.product_details,
          material_id: selectedMaterialId,
          remaining_width: remainingMaterial.width,
          remaining_length: remainingMaterial.length,
          balance_quantity: balanceQty,
        };

        const matResponse = await fetch(
          `${API_URL}/api/create_pending_material/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(materialPayload),
          }
        );

        const matResult = await matResponse.json();

        if (!matResponse.ok) {
          toast({
            title: 'Error',
            description:
              matResult.error || 'Failed to create updated material.',
            variant: 'destructive',
          });
          return;
        }
      }

      const programmerPayload = {
        ...formData,
        processed_width:
          Number(formData.balance_quantity) === 0
            ? remainingMaterial.original_width
            : formData.processed_width,

        processed_length:
          Number(formData.balance_quantity) === 0
            ? remainingMaterial.original_length
            : formData.processed_length,

        created_by,
      };

      const response = await fetch(`${API_URL}/api/add_programer_Details/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programmerPayload),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Programer details added successfully.',
        });
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Something went wrong.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Submission failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit programmer details.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Field Label Map for Readable Names
  const LABELS: Record<keyof ProgramerFormData, string> = {
    product_details: 'Product ID',
    material_details: 'Material ID',
    program_no: 'Programer Number',
    program_date: 'Program Date',
    processed_quantity: 'Processed Quantity',
    balance_quantity: 'Balance Quantity',

    processed_width: 'Processed Width',
    processed_length: 'Processed Length',

    used_weight: 'Used Weight (Kg)',
    number_of_sheets: 'Number of Comp. per Sheets',
    cut_length_per_sheet: 'Cut Length per Sheet',
    pierce_per_sheet: 'Pierce per Sheet',
    processed_mins_per_sheet: 'Minutes Processed per Sheet',
    total_planned_hours: 'Total Processed Hours',
    total_meters: 'Total Meters',
    total_piercing: 'Total Piercings',
    total_used_weight: 'Total Used Weight (Kg)',
    total_no_of_sheets: 'Total No.of Comp. per  Sheets',
    remarks: 'Remarks',
    created_by: 'Created By',
  };



  // --- UI Rendering
  return (
    <>
      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this programmer data? Once
              submitted, it cannot be edited.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex justify-end gap-3 mt-4'>
            <Button
              variant='outline'
              onClick={() => setConfirmOpen(false)}
              className='hover:bg-gray-200 hover:text-black'
            >
              Cancel
            </Button>
            <Button
              className='bg-green-700 hover:bg-green-800 text-white'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='w-full mx-auto bg-white rounded-3xl p-4'>
        <div className={`space-y-6 ${currentStep === 2 ? 'mt-0' : 'mt-8'}`}>
          {/* --- Step 1 --- */}
          {currentStep === 1 && (
            <div className='space-y-6'>
              <div className='grid md:grid-cols-3 gap-6'>
                {/* Material Dropdown */}
                <div className='flex flex-col space-y-1.5'>
                  <label className='text-sm font-medium text-gray-700'>
                    Material
                  </label>
                  <select
                    name='material_details'
                    value={formData.material_details}
                    onChange={handleChange}
                    className={`border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${formErrors.material_details
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  >
                    <option value=''>Select Material</option>
                    {materials
                      .filter((mat) => mat.programer_status === 'pending')
                      .map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          MT- {mat.mat_type} / G- {mat.mat_grade} / T-{' '}
                          {mat.thick}mm / W- {mat.width} / L- {mat.length} /
                          Qty- {mat.quantity}
                        </option>
                      ))}
                  </select>
                </div>

                {['program_no', 'program_date'].map((key) => (
                  <div key={key} className='flex flex-col space-y-1.5'>
                    <label
                      htmlFor={key}
                      className='text-sm font-medium text-gray-700'
                    >
                      {LABELS[key as keyof ProgramerFormData]}
                    </label>
                    <input
                      type={key === 'program_date' ? 'date' : 'text'}
                      name={key}
                      id={key}
                      value={formData[key as keyof ProgramerFormData]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={LABELS[key as keyof ProgramerFormData]}
                      className={`border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${formErrors[key]
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <>
              <div className='w-full grid grid-cols-3 gap-6 '>
                {/* ================== QUANTITY ================== */}
                <div className='w-[55%] flex flex-col md:flex-row  items-center gap-6'>
                  {['processed_quantity', 'balance_quantity'].map((key) => (
                    <div key={key} className='w-full flex flex-col gap-1'>
                      <label className='text-sm font-medium text-gray-700'>
                        {LABELS[key]}
                      </label>
                      <input
                        type='text'
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        readOnly={key === 'balance_quantity'}
                        className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${key === 'balance_quantity'
                          ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                          : formErrors[key]
                            ? 'border-red-500 focus:ring-red-400'
                            : 'border-gray-300 focus:ring-blue-500'
                          }`}
                      />
                    </div>
                  ))}
                </div>

                {/* ================== WEIGHT ================== */}
                <div className='w-[55%] flex flex-col md:flex-row items-center  gap-6'>
                  {['used_weight', 'total_used_weight'].map((key) => (
                    <div key={key} className='w-full flex flex-col gap-1'>
                      <label className='text-sm font-medium text-gray-700'>
                        {LABELS[key]}
                      </label>
                      <input
                        type='text'
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        readOnly={key === 'total_used_weight'}
                        className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${key === 'total_used_weight'
                          ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                          : formErrors[key]
                            ? 'border-red-500 focus:ring-red-400'
                            : 'border-gray-300 focus:ring-blue-500'
                          }`}
                      />
                    </div>
                  ))}
                </div>

                {/* ================== SHEETS ================== */}
                <div className='w-[55%] flex flex-col md:flex-row items-center gap-6'>
                  {['number_of_sheets', 'total_no_of_sheets'].map((key) => (
                    <div key={key} className='w-full flex flex-col gap-1'>
                      <label className='text-sm font-medium text-gray-700'>
                        {LABELS[key]}
                      </label>
                      <input
                        type='text'
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        readOnly={key === 'total_no_of_sheets'}
                        className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${key === 'total_no_of_sheets'
                          ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                          : formErrors[key]
                            ? 'border-red-500 focus:ring-red-400'
                            : 'border-gray-300 focus:ring-blue-500'
                          }`}
                      />
                    </div>
                  ))}
                </div>

                {/* ================== PROCESSED WIDTH + REMAIN WIDTH ================== */}
                {Number(formData.balance_quantity) > 0 && (
                  <>
                    <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
                      {/* Processed Width */}
                      <div className='w-full flex flex-col gap-1'>
                        <label className='text-sm font-medium text-gray-700'>
                          Processed Width
                        </label>
                        <input
                          type='text'
                          name='processed_width'
                          value={formData.processed_width}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`border rounded-lg px-3 py-1 max-w-[180px] ${formErrors.processed_width
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-gray-300'
                            }`}
                        />
                      </div>

                      {/* Remaining Width */}
                      <div className='w-full flex flex-col gap-1'>
                        <label className='text-sm font-medium text-gray-700'>
                          Remaining Width
                        </label>
                        <input
                          type='text'
                          readOnly
                          value={remainingMaterial.width}
                          className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
                        />
                      </div>
                    </div>

                    {/* ================== PROCESSED LENGTH + REMAIN LENGTH ================== */}
                    <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
                      {/* Processed Length */}
                      <div className='w-full flex flex-col gap-1'>
                        <label className='text-sm font-medium text-gray-700'>
                          Processed Length
                        </label>
                        <input
                          type='text'
                          name='processed_length'
                          value={formData.processed_length}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${formErrors.processed_length
                            ? 'border-red-500 focus:ring-red-400'
                            : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        />
                      </div>

                      {/* Remaining Length */}
                      <div className='w-full flex flex-col gap-1'>
                        <label className='text-sm font-medium text-gray-700'>
                          Remaining Length
                        </label>
                        <input
                          type='text'
                          readOnly
                          value={remainingMaterial.length}
                          className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className='w-full grid grid-cols-3 gap-6 mt-5 '>
                {/* ===== BOX 1 : CUT LENGTH + TOTAL METERS ===== */}
                <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
                  {/* Cut Length */}
                  <div className='w-full flex flex-col gap-1'>
                    <label className='text-sm font-medium text-gray-700'>
                      {LABELS.cut_length_per_sheet}
                    </label>
                    <input
                      type='text'
                      name='cut_length_per_sheet'
                      value={formData.cut_length_per_sheet}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${formErrors.cut_length_per_sheet
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    />
                  </div>

                  {/* Total Meters */}
                  <div className='w-full flex flex-col gap-1'>
                    <label className='text-sm font-medium text-gray-700'>
                      Total Meters
                    </label>
                    <input
                      type='text'
                      readOnly
                      value={formData.total_meters}
                      className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
                    />
                  </div>
                </div>

                {/* ===== BOX 2 : PIERCE + TOTAL PIERCING ===== */}
                <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
                  {/* Pierce */}
                  <div className='w-full flex flex-col gap-1'>
                    <label className='text-sm font-medium text-gray-700'>
                      {LABELS.pierce_per_sheet}
                    </label>
                    <input
                      type='text'
                      name='pierce_per_sheet'
                      value={formData.pierce_per_sheet}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${formErrors.pierce_per_sheet
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    />
                  </div>

                  {/* Total Piercing */}
                  <div className='w-full flex flex-col gap-1'>
                    <label className='text-sm font-medium text-gray-700'>
                      Total Piercing
                    </label>
                    <input
                      type='text'
                      readOnly
                      value={formData.total_piercing}
                      className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
                    />
                  </div>
                </div>

                {/* ===== BOX 3 : MINUTES + TOTAL HOURS ===== */}
                <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
                  {/* Minutes */}
                  <div className='w-full flex flex-col gap-1'>
                    <label className='text-sm font-medium text-gray-700'>
                      {LABELS.processed_mins_per_sheet}
                    </label>
                    <input
                      type='text'
                      name='processed_mins_per_sheet'
                      value={formData.processed_mins_per_sheet}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${formErrors.processed_mins_per_sheet
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    />
                  </div>

                  {/* Total Hours */}
                  <div className='w-full flex flex-col gap-1'>
                    <label className='text-sm font-medium text-gray-700'>
                      Total Hours
                    </label>
                    <input
                      type='text'
                      readOnly
                      value={formData.total_planned_hours}
                      className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
                    />
                  </div>
                </div>
              </div>

              <div className=' w-1/3 '>
                <h4 className='text-md font-semibold text-gray-700'>Remarks</h4>
                <input
                  type='text'
                  name='remarks'
                  value={formData.remarks}
                  onChange={handleChange}
                  className={`border-2 rounded-lg shadow-sm px-3 py-1 w-[calc(100%-70px)] focus:ring-2`}
                />
              </div>
            </>
          )}
        </div>

        {/* --- Navigation Buttons --- */}
        <div className='flex flex-col sm:flex-row justify-center gap-4 mt-4'>
          <Button
            variant='outline'
            onClick={handleBack}
            className='border-gray-400 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-100 hover:text-gray-700 w-full sm:w-auto'
          >
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              className='bg-blue-700 text-white px-6 py-3 rounded-xl hover:bg-blue-600 w-full sm:w-auto'
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              className='bg-green-700 text-white px-6 py-3 rounded-xl hover:bg-green-800 w-full sm:w-auto'
              onClick={() => {
                const isValid = handleValidateAll();
                if (isValid) setConfirmOpen(true);
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProgramerFormWrapper;
