import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';

export function useGetCompanyReport(month) {
  const { user } = useAuthContext();
  const storedBranch = sessionStorage.getItem('selectedBranch');
  let parsedBranch = storedBranch;

  if (storedBranch !== 'all') {
    try {
      parsedBranch = JSON.parse(storedBranch);
    } catch (error) {
      console.error('Error parsing storedBranch:', error);
    }
  }

  const monthQuery = month.month ? `month=${month.month}` : '';
  const branchQuery = parsedBranch && parsedBranch !== 'all' ? `branch=${parsedBranch}` : '';

  const queryString = [monthQuery, branchQuery].filter(Boolean).join('&');

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/company-report${queryString ? `?${queryString}` : ''}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      companyAllData: data || [],
      companyAllDataLoading: isLoading,
      companyAllDataError: error,
      companyAllDataValidating: isValidating,
      companyAllDataEmpty: !isLoading && !data?.length,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
