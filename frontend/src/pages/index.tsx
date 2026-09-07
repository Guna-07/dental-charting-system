import { useState } from "react";
import { Group, Pagination, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchInput } from "@/components/common/SearchInput";
import { AddPatientFab } from "@/features/patients/components/AddPatientFab";
import { PatientFormModal } from "@/features/patients/components/PatientFormModal";
import { PatientListView } from "@/features/patients/components/PatientListView";
import { usePatients } from "@/features/patients/hooks/usePatientQueries";

const PAGE_SIZE = 20;

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpened, formHandlers] = useDisclosure(false);

  const query = usePatients({ search, page, limit: PAGE_SIZE });

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const patients = query.data?.items ?? [];
  const totalPages = query.data?.meta.total_pages ?? 1;

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle={
          query.data ? `${query.data.meta.total} registered` : "Loading…"
        }
      />

      <Stack gap="lg">
        <Group>
          <SearchInput
            value={search}
            onDebouncedChange={onSearch}
            w={{ base: "100%", sm: 320 }}
          />
        </Group>

        {query.isLoading ? (
          <LoadingState label="Loading patients…" />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : patients.length === 0 ? (
          <EmptyState
            title={search ? "No matching patients" : "No patients yet"}
            description={
              search
                ? "Try a different name, phone number, or patient ID."
                : "Add your first patient to start charting."
            }
            action={
              search
                ? undefined
                : { label: "Add Patient", onClick: formHandlers.open }
            }
          />
        ) : (
          <>
            <PatientListView patients={patients} />
            {totalPages > 1 ? (
              <Group justify="center">
                <Pagination value={page} onChange={setPage} total={totalPages} />
              </Group>
            ) : null}
          </>
        )}
      </Stack>

      <AddPatientFab onClick={formHandlers.open} />
      <PatientFormModal
        opened={formOpened}
        onClose={formHandlers.close}
        mode="create"
      />
    </>
  );
}
