import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';

// UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Types
import { ProductType } from '@/types/inward.type';

// Components
import ProgramList from '@/components/ProgramerComponents/ProgramerList';
import ProgramDetail from '@/components/ProgramerComponents/ProgramerDetail';
import ProgramerForm from '@/components/ProgramerComponents/ProgramerForm';
import { StepProgressBar } from '@/components/ReusableComponents/StepProgressBar';
const ProgramerDashboard: React.FC = () => {
  const { toast } = useToast();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentStep, setCurrentStep] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const safeArray = (data) => (Array.isArray(data) ? data : []);

  // --------------------------- FETCH DATA -----------------------------
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/get_full_products/`);
      let data = [];

      try {
        data = await res.json();
      } catch {
        data = [];
      }

      setProducts(safeArray(data));

      if (!Array.isArray(data)) {
        toast({
          variant: 'destructive',
          title: 'Invalid data',
          description: 'Server returned an incorrect response.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fetch Error',
        description: 'Failed to load product data.',
      });
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --------------------------- FILTER DATA -----------------------------
  const filteredProducts = useMemo(() => {
    const search = searchQuery.toLowerCase();

    return products
      .filter((item) => {
        const matchSearch =
          item.company_name?.toLowerCase().includes(search) ||
          item.customer_name?.toLowerCase().includes(search) ||
          item.inward_slip_number?.toLowerCase().includes(search);

        const matchStatus =
          statusFilter === 'all' ||
          item.programer_status?.toLowerCase() === statusFilter.toLowerCase();

        return matchSearch && matchStatus;
      })
      .sort((a, b) => b.id - a.id);
  }, [products, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, currentPage]);

  // --------------------------- VIEW HANDLERS -----------------------------
  const handleViewDetail = (item: ProductType) => {
    setSelectedProduct(item);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedProduct(null);
    setView('list');
  };

  const handleFormSuccess = async () => {
    await fetchProducts();
    handleBack();

    toast({
      title: 'Program Updated',
      description: 'Program details have been successfully updated.',
    });
  };

  const headerTitle = useMemo(() => {
    switch (view) {
      case 'list':
        return 'Programer Dashboard';
      case 'detail':
        return 'Program Details';
      case 'form':
        return 'Program Update Form';
      default:
        return 'Programer Dashboard';
    }
  }, [view]);

  // --------------------------- LOADING UI -----------------------------
  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p className='text-lg font-semibold text-slate-600 animate-pulse'>
          Loading data...
        </p>
      </div>
    );
  }

  // --------------------------- MAIN UI -----------------------------
  return (
    <div className='px-12 py-6'>
      <div className='max-w-8xl mx-auto'>
        {/* HEADER */}
        <div
          className={`w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 ${view === 'form' ? '-my-8 -mb-4' : ''
            }`}
        >
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800'>
            {headerTitle}
          </h1>

          <div className='flex flex-col sm:flex-row items-center gap-4 overflow-x-hidden'>
            {view === 'list' && (
              <>
                <input
                  type='text'
                  placeholder='Search by company, customer or slip...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='border px-4 py-3 rounded-full w-full sm:w-72 text-sm outline-none'
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='border px-4 py-2 rounded-lg text-sm'
                >
                  <option value='all'>All</option>
                  <option value='pending'>Pending</option>
                  <option value='completed'>Completed</option>
                </select>
              </>
            )}

            {view === 'detail' && selectedProduct && (
              <div className='flex gap-4'>
                <button
                  onClick={handleBack}
                  className='px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm'
                >
                  Back
                </button>

                {selectedProduct.programer_status?.toLowerCase() ===
                  'pending' && (
                    <Button
                      onClick={() => setView('form')}
                      className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                    >
                      Proceed
                    </Button>
                  )}
              </div>
            )}

            {view === 'form' && (
              <div className='w-[1000px] -mr-[180px]'>
                <StepProgressBar
                  steps={['Programer Details', 'Program Data']}
                  currentStep={currentStep}
                  activeColor='bg-blue-700'
                  inactiveColor='bg-gray-300'
                />
              </div>
            )}
          </div>
        </div>

        <Card className='border-none shadow-none bg-transparent'>
          <CardContent className='p-0'>
            {/* LIST */}
            {view === 'list' && (
              <>
                {paginatedData.length === 0 ? (
                  <div className='flex justify-center items-center py-20'>
                    <p className='text-lg font-medium text-slate-600'>
                      No product found.
                    </p>
                  </div>
                ) : (
                  <>
                    <ProgramList
                      data={paginatedData}
                      onView={handleViewDetail}
                    />

                    {totalPages > 1 && (
                      <div className='flex justify-end items-center gap-3 mt-6 text-sm'>
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                          className='px-4 py-1 bg-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-300'
                        >
                          Prev
                        </button>

                        <span className='font-medium text-slate-700'>
                          Page {currentPage} / {totalPages}
                        </span>

                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          className='px-4 py-1 bg-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-300'
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* DETAIL */}
            {view === 'detail' && selectedProduct && (
              <ProgramDetail item={selectedProduct} />
            )}

            {/* FORM */}
            {view === 'form' && selectedProduct && (
              <ProgramerForm
                item={selectedProduct}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                onBack={handleBack}
                onSuccess={handleFormSuccess}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgramerDashboard;
