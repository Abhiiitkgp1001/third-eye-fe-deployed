/**
 * Example usage of tRPC in components
 * Copy these patterns into your actual components
 */

"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

// ==================== QUERY EXAMPLE ====================
export function CompanyListsExample() {
  const { data: lists, isLoading, error } = trpc.companyLists.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Company Lists</h1>
      {lists?.map((list) => (
        <div key={list.id}>
          <h2>{list.name}</h2>
          <p>Status: {list.syncStatus}</p>
          <p>Enabled: {list.enabled ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  );
}

// ==================== MUTATION EXAMPLE ====================
export function CreateCompanyListExample() {
  const [name, setName] = useState("");
  const utils = trpc.useUtils();

  const createList = trpc.companyLists.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch all company lists
      utils.companyLists.getAll.invalidate();
      setName("");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createList.mutate({
      name,
      prompt: "Track companies in the tech industry",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="List name"
      />
      <button type="submit" disabled={createList.isPending}>
        {createList.isPending ? "Creating..." : "Create List"}
      </button>
    </form>
  );
}

// ==================== DETAIL VIEW EXAMPLE ====================
export function CompanyListDetailExample({ listId }: { listId: string }) {
  const { data: list, isLoading } = trpc.companyLists.getById.useQuery({
    id: listId,
  });

  const utils = trpc.useUtils();

  const addCompany = trpc.companyLists.addCompany.useMutation({
    onSuccess: () => {
      // Refetch the list to show the new company
      utils.companyLists.getById.invalidate({ id: listId });
    },
  });

  const removeCompany = trpc.companyLists.removeCompany.useMutation({
    onSuccess: () => {
      utils.companyLists.getById.invalidate({ id: listId });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!list) return <div>List not found</div>;

  return (
    <div>
      <h1>{list.name}</h1>
      <p>Prompt: {list.prompt}</p>

      <h2>Companies ({list.companies?.length || 0})</h2>
      <ul>
        {list.companies?.map((company) => (
          <li key={company.id}>
            <a href={company.linkedinUrl}>{company.linkedinUrl}</a>
            <button onClick={() => removeCompany.mutate({ companyId: company.id })}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() =>
          addCompany.mutate({
            listId,
            linkedinUrl: "https://www.linkedin.com/company/example/",
          })
        }
      >
        Add Example Company
      </button>
    </div>
  );
}

// ==================== UPDATE EXAMPLE ====================
export function UpdateListExample({ listId }: { listId: string }) {
  const [name, setName] = useState("");
  const utils = trpc.useUtils();

  const updateList = trpc.companyLists.update.useMutation({
    onSuccess: () => {
      utils.companyLists.getAll.invalidate();
      utils.companyLists.getById.invalidate({ id: listId });
    },
  });

  const handleUpdate = () => {
    updateList.mutate({
      id: listId,
      name,
    });
  };

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New name"
      />
      <button onClick={handleUpdate} disabled={updateList.isPending}>
        {updateList.isPending ? "Updating..." : "Update List"}
      </button>
    </div>
  );
}

// ==================== DELETE EXAMPLE ====================
export function DeleteListExample({ listId }: { listId: string }) {
  const utils = trpc.useUtils();

  const deleteList = trpc.companyLists.delete.useMutation({
    onSuccess: () => {
      utils.companyLists.getAll.invalidate();
      // Redirect to lists page
      window.location.href = "/dashboard/companies";
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this list?")) {
      deleteList.mutate({ id: listId });
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteList.isPending}>
      {deleteList.isPending ? "Deleting..." : "Delete List"}
    </button>
  );
}

// ==================== OPTIMISTIC UPDATE EXAMPLE ====================
export function OptimisticUpdateExample({ listId }: { listId: string }) {
  const utils = trpc.useUtils();

  const toggleEnabled = trpc.companyLists.update.useMutation({
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await utils.companyLists.getAll.cancel();

      // Snapshot the previous value
      const previousLists = utils.companyLists.getAll.getData();

      // Optimistically update the cache
      utils.companyLists.getAll.setData(undefined, (old) =>
        old?.map((list) =>
          list.id === newData.id
            ? { ...list, enabled: newData.enabled ?? list.enabled }
            : list
        )
      );

      // Return a context object with the snapshotted value
      return { previousLists };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, roll back to the previous value
      utils.companyLists.getAll.setData(undefined, context?.previousLists);
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.companyLists.getAll.invalidate();
    },
  });

  const { data: lists } = trpc.companyLists.getAll.useQuery();
  const currentList = lists?.find((l) => l.id === listId);

  return (
    <button
      onClick={() =>
        toggleEnabled.mutate({
          id: listId,
          enabled: !currentList?.enabled,
        })
      }
    >
      {currentList?.enabled ? "Disable" : "Enable"} List
    </button>
  );
}

// ==================== PEOPLE LISTS EXAMPLE ====================
export function PeopleListsExample() {
  const { data: lists, isLoading } = trpc.peopleLists.getAll.useQuery();

  const createList = trpc.peopleLists.create.useMutation({
    onSuccess: () => {
      trpc.useUtils().peopleLists.getAll.invalidate();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>People Lists</h1>
      {lists?.map((list) => (
        <div key={list.id}>
          <h2>{list.name}</h2>
        </div>
      ))}

      <button
        onClick={() =>
          createList.mutate({
            name: "LinkedIn Leads",
            prompt: "Track potential leads from LinkedIn",
          })
        }
      >
        Create People List
      </button>
    </div>
  );
}
