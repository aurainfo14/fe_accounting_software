import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcher } from 'src/utils/axios';
import { useAuthContext } from 'src/auth/hooks';
import axios from 'axios';

// ----------------------------------------------------------------------

export function useGetNotes() {
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

  const branchQuery = parsedBranch && parsedBranch !== 'all' ? `branchId=${parsedBranch}` : '';

  const queryString = [branchQuery].filter(Boolean).join('&');

  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/note${queryString ? `?${queryString}` : ''}`;
  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      notes: data?.data || [],
      notesLoading: isLoading,
      notesError: error,
      notesValidating: isValidating,
      notesEmpty: !isLoading && !data?.data?.length,
      mutate,
    }),
    [data?.data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetNote(noteId) {
  const { user } = useAuthContext();
  const URL = noteId ? `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/note/${noteId}` : '';
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      note: data?.data || null,
      noteLoading: isLoading,
      noteError: error,
      noteValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function createNote(noteData, user) {
  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/note`;
  
  const formData = new FormData();
  formData.append('title', noteData.title);
  formData.append('description', noteData.description);
  formData.append('date', noteData.date);
  if (noteData.branchId) {
    formData.append('branch', noteData.branchId);
  }
  if (noteData.invoice && noteData.invoice.length > 0) {
    noteData.invoice.forEach((file) => {
      formData.append('invoice', file);
    });
  }

  const response = await axios.post(URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

// ----------------------------------------------------------------------

export async function updateNote(noteId, noteData, user) {
  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/note/${noteId}`;
  
  const formData = new FormData();
  formData.append('title', noteData.title);
  formData.append('description', noteData.description);
  formData.append('date', noteData.date);
  if (noteData.branchId) {
    formData.append('branch', noteData.branchId);
  }
  if (noteData.invoice && noteData.invoice.length > 0) {
    noteData.invoice.forEach((file) => {
      formData.append('invoice', file);
    });
  }

  const response = await axios.put(URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

// ----------------------------------------------------------------------

export async function deleteNote(noteId, user) {
  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/note/${noteId}`;
  
  const response = await axios.delete(URL);
  return response.data;
}

// ----------------------------------------------------------------------

export async function downloadInvoice(noteId, fileName, user) {
  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/note/${noteId}/invoice/${fileName}`;
  
  const response = await axios.get(URL, {
    responseType: 'blob',
  });
  
  return response.data;
}

// ----------------------------------------------------------------------

export async function removeInvoice(noteId, invoiceUrl, user) {
  const URL = `${import.meta.env.VITE_BASE_URL}/${user?.company?._id}/note/${noteId}/remove-invoice`;
  
  const response = await axios.delete(URL, {
    data: { invoiceUrl }
  });
  
  return response.data;
}