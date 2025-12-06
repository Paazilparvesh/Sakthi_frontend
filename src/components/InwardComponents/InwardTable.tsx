import { Button } from '@/components/ui/button';
import { ProductType, InwardProps, Material } from '@/types/inward.type';
import { useEffect, useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { fetchJSON } from '@/utils/api';

interface Density {
  id: number;
  material_name: string;
  density_value: number;
}

const InwardTable: React.FC<InwardProps> = ({ formData, setFormData }) => {
  const [items, setItems] = useState<Density[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  const loadMaterial = useCallback(async () => {
    const res = await fetchJSON<Density[]>(`${API_URL}/api/get_material_type/`);

    setItems(res);
  }, [API_URL]);

  useEffect(() => {
    loadMaterial();
  }, [loadMaterial]);

  const MATERIAL_DENSITIES = items.reduce((acc, item) => {
    acc[item.material_name] = item.density_value;
    return acc;
  }, {} as Record<string, number>);

  // List of material types for dropdown
  const TEC = items.map((item) => item.material_name);

  // ? Helper: Calculate Unit Weight, Total Weight, and Stock Due
  const recalcWeights = (mat: Material) => {
    const { thick, width, length, density, quantity } = mat;

    // Volume-based unit weight
    const volume =
      Number(thick) && Number(width) && Number(length)
        ? Number(thick) * Number(width) * Number(length)
        : 0;

    const unitWeight =
      volume > 0 && Number(density) > 0
        ? parseFloat((volume * Number(density)).toFixed(3))
        : '';

    const totalWeight =
      Number(quantity) > 0 && Number(unitWeight) > 0
        ? parseFloat((Number(quantity) * Number(unitWeight)).toFixed(3))
        : '';

    // Simple stock due logic (customize as needed)
    let stock_due = '';
    if (Number(totalWeight) > 0 && Number(totalWeight) < 50) stock_due = '1';
    else if (Number(totalWeight) >= 50 && Number(totalWeight) < 200)
      stock_due = '3';
    else if (Number(totalWeight) >= 200) stock_due = '5';

    return {
      ...mat,
      unit_weight: unitWeight,
      total_weight: totalWeight,
      stock_due,
    };
  };

  // Ensure at least one default row exists
  useEffect(() => {
    if (!formData.materials || formData.materials.length === 0) {
      setFormData(
        (prev): ProductType => ({
          ...prev,
          materials: [
            {
              mat_type: '',
              mat_grade: '',
              thick: '',
              width: '',
              length: '',
              density: '',
              unit_weight: '',
              quantity: '',
              total_weight: '',
              bay: '',
              stock_due: '',
              remarks: '',
            },
          ],
        })
      );
    }
  }, [formData, setFormData]);

  // Add new empty row
  const handleAddRow = () => {
    setFormData(
      (prev): ProductType => ({
        ...prev,
        materials: [
          ...(prev.materials || []),
          {
            mat_type: '',
            mat_grade: '',
            thick: '',
            width: '',
            length: '',
            density: '',
            unit_weight: '',
            quantity: '',
            total_weight: '',
            bay: '',
            stock_due: '',
            remarks: '',
          },
        ],
      })
    );
  };

  // Remove a specific row
  const handleRemoveRow = (index: number) => {
    if (formData.materials && formData.materials.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  // Handle input changes
  const handleInputChange = (
    index: number,
    field: keyof Material,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedMaterials = [...(prev.materials || [])];
      let mat = { ...updatedMaterials[index] };

      (mat[field] as string | number) = value;

      // ? If mat_type changes, auto-assign Density
      if (field === 'mat_type' && typeof value === 'string') {
        const newDensity = MATERIAL_DENSITIES[value] || '';
        mat.density = newDensity;
      }

      // If quantity or type changes, recalc weights
      if (['mat_type', 'quantity'].includes(field)) {
        mat = recalcWeights(mat);
      }

      updatedMaterials[index] = mat;
      return { ...prev, materials: updatedMaterials };
    });
  };

  // Dimension Calculation Formula
  const handleDimensionChange = (
    index: number,
    field: keyof ProductType,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedMaterials = [...(prev.materials || [])];
      let mat = { ...updatedMaterials[index] };
      mat[field] = value;

      mat = recalcWeights(mat);

      updatedMaterials[index] = mat;
      return { ...prev, materials: updatedMaterials };
    });
  };

  // Tab to Add Row
  const handleTabToAddRow = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Only trigger on TAB (without Shift)
    if (e.key === 'Tab' && !e.shiftKey) {
      const isLastRow = index === formData.materials.length - 1;

      if (isLastRow) {
        e.preventDefault(); // stop focus from leaving
        handleAddRow(); // add new row

        // Move cursor to first field of new row (optional enhancement)
        setTimeout(() => {
          const nextInput = document.querySelector(
            `#mat_type_${index + 1}`
          ) as HTMLInputElement | null;

          nextInput?.focus();
        }, 50);
      }
    }
  };

  return (
    <div className='rounded-xl p-4 '>
      {/* Table */}
      <div className='overflow-x-auto rounded-xl border border-gray-200 scrollbar-hide'>
        <table className='w-full min-w-[800px] border-collapse text-center'>
          <thead className='bg-gray-200 text-gray-700 text-xs sm:text-sm md:text-base font-semibold'>
            <tr>
              <th className='py-2 px-1 border w-[4%]'>S.No</th>
              <th className='py-2 px-1 border w-[8%]'>Bay</th>
              <th className='py-2 px-1 border w-[8%]'>TEC</th>
              <th className='py-2 px-1 border w-[8%]'>Grade</th>
              <th className='py-2 px-1 border w-[40%]'>Dimensions</th>
              <th className='py-2 px-1 border w-[6%]'>Qty</th>
              <th className='py-2 px-1 border w-[8%]'>Total weight</th>
              <th className='py-2 px-1 border w-[8%]'>Stock Due</th>
              <th className='py-2 px-1 border w-[15%]'>Remarks</th>
              <th className='py-2 px-1 border w-[7%]'>Action</th>
            </tr>
          </thead>
          <tbody>
            {formData.materials?.map((mat, index) => (
              <tr
                key={index}
                className='border text-gray-700 transition-colors'
              >
                <td className='border font-medium'>{index + 1}</td>

                {/* Bay */}
                <td className='border'>
                  <input
                    type='text'
                    value={mat.bay}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow only digits (no e, no -, no +, no dots)
                      if (!/^[0-9]*$/.test(val)) return;
                      handleInputChange(index, 'bay', e.target.value);
                    }}
                    placeholder='Bay'
                    className='w-full h-14 px-2 py-1 text-xs sm:text-sm text-center bg-transparent outline-none'
                  />
                </td>

                {/* Material Type Dropdown */}
                <td className='border px-2'>
                  <select
                    id={`mat_type_${index}`}
                    title='Select material type (TEC)'
                    value={mat.mat_type}
                    onChange={(e) =>
                      handleInputChange(index, 'mat_type', e.target.value)
                    }
                    className={`w-full border border-gray-300 rounded-lg px-2 py-1 text-xs sm:text-sm text-center outline-none bg-white`}
                  >
                    <option value=''>Select</option>
                    {TEC.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Material Grade */}
                <td className='border'>
                  <input
                    type='text'
                    value={mat.mat_grade}
                    onChange={(e) =>
                      handleInputChange(index, 'mat_grade', e.target.value)
                    }
                    placeholder='Enter Grade'
                    className='w-full h-14 px-2 py-1 text-xs sm:text-sm text-center outline-none bg-transparent'
                  />
                </td>

                {/* Dimensions Section */}
                <td className='border'>
                  <div className='flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 px-2'>
                    {['thick', 'width', 'length'].map((field, idx) => (
                      <div key={field} className='flex items-center'>
                        {/* Input */}
                        <input
                          type='text'
                          inputMode='decimal'
                          value={mat[field as keyof ProductType] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            // Allow only digits (no e, no -, no +, no dots)
                            if (!/^\d*\.?\d*$/.test(val)) return;
                            // ? MAX LIMIT for width = 25
                            if (field === 'thick' && Number(val) > 25) return;
                            handleDimensionChange(
                              index,
                              field as keyof ProductType,
                              val
                            );
                          }}
                          onPaste={(e) => {
                            const pasted = e.clipboardData.getData('text');
                            if (!/^\d*\.?\d*$/.test(pasted)) {
                              e.preventDefault();
                              return;
                            }
                            // Prevent paste > 25 for width
                            if (field === 'thick' && Number(pasted) > 25) {
                              e.preventDefault();
                            }
                          }}
                          placeholder={field}
                          className='w-14 border border-gray-300 rounded-lg px-1 py-1 text-xs sm:text-sm text-center outline-none'
                        />

                        {/* Add X between fields */}
                        {idx < 2 && (
                          "×"
                        )}
                      </div>
                    ))}
                    <span className='mx-1 text-gray-600 font-semibold text-sm'>
                      ×
                    </span>
                    <input
                      type='number'
                      readOnly
                      value={mat.density || ''}
                      placeholder='Density'
                      className='w-1/3 border border-gray-300 rounded-lg px-1 py-1 text-xs sm:text-sm text-center bg-gray-100 text-gray-700 outline-none'
                      title='Auto from TEC'
                    />
                    <span className='mx-1 text-gray-600 font-semibold text-sm'>
                      =
                    </span>
                    <input
                      type='number'
                      readOnly
                      value={mat.unit_weight || ''}
                      placeholder='Unit Wt.'
                      className='w-1/4 border border-gray-300 rounded-lg pl-1 py-1 text-xs sm:text-sm text-center bg-gray-100 text-gray-700 outline-none'
                      title='Auto-calculated'
                    />
                  </div>
                </td>

                {/* Quantity */}
                <td className='border'>
                  <input
                    type='text'
                    value={mat.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow only digits (no e, no -, no +, no dots)
                      if (!/^\d*\.?\d*$/.test(val)) return;
                      handleInputChange(index, 'quantity', val);
                    }}
                    placeholder='0'
                    className='w-full h-14 px-2 py-1 text-xs sm:text-sm text-center bg-transparent outline-none'
                  />
                </td>

                {/* Total Weight in Kgs */}
                <td className='border'>
                  <input
                    type='number'
                    value={mat.total_weight}
                    onChange={(e) =>
                      handleInputChange(index, 'total_weight', e.target.value)
                    }
                    placeholder='Total Weight'
                    readOnly
                    className='w-full h-14 px-2 py-1 text-xs sm:text-sm text-center bg-gray-100 outline-none'
                  />
                </td>

                {/* Stock Due */}
                <td className='border'>
                  <input
                    type='text'
                    value={mat.stock_due}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow only digits (no e, no -, no +, no dots)
                      if (!/^\d*\.?\d*$/.test(val)) return;
                      handleInputChange(index, 'stock_due', e.target.value);
                    }}
                    placeholder='Days'
                    className='w-full h-14 px-2 py-1 text-xs sm:text-sm text-center bg-transparent outline-none'
                  />
                </td>

                {/* Remarks */}
                <td className='border'>
                  <input
                    type='text'
                    value={mat.remarks}
                    onChange={(e) =>
                      handleInputChange(index, 'remarks', e.target.value)
                    }
                    onKeyDown={(e) => handleTabToAddRow(e, index)}
                    placeholder='Optional'
                    className='w-full h-14 px-2 text-xs sm:text-sm bg-transparent outline-none'
                  />
                </td>

                {/* Remove Button */}
                <td
                  className='border flex justify-center group cursor-pointer'
                  onClick={() => handleRemoveRow(index)}
                >
                  <Button
                    variant='destructive'
                    className='w-full h-14 flex items-center justify-center bg-transparent hover:bg-transparent group-hover:scale-125 transition-all text-red-500'
                    title='Remove Row'
                  >
                    <Trash2 className='w-4 h-4 sm:w-6 sm:h-6' />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <div className='flex justify-end mt-4'>
        <Button
          className='bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition-all'
          onClick={handleAddRow}
        >
          + Add Row
        </Button>
      </div>
    </div>
  );
};

export default InwardTable;