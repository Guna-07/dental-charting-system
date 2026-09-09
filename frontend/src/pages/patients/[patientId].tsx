import { useRouter } from "next/router";
import { Tabs } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { PROFILE_TABS, type ProfileTab } from "@/app/router/routes";
import { PatientHeader } from "@/features/patients/components/PatientHeader";
import { PatientOverviewTab } from "@/features/patients/components/PatientOverviewTab";
import { PatientFormModal } from "@/features/patients/components/PatientFormModal";
import { usePatient } from "@/features/patients/hooks/usePatientQueries";
import { DentalChart } from "@/features/dental-chart/components/DentalChart";
import { SurfaceChart } from "@/features/surface-chart/components/SurfaceChart";
import { GingivalChart } from "@/features/gingival-chart/components/GingivalChart";

export default function PatientProfilePage() {
  const router = useRouter();
  const patientId =
    typeof router.query.patientId === "string" ? router.query.patientId : "";

  const tabParam = (router.query.tab as ProfileTab) || "overview";
  const [editOpened, editHandlers] = useDisclosure(false);

  const query = usePatient(patientId);

  const setTab = (value: string | null) => {
    if (!value) return;
    router.replace(
      { pathname: router.pathname, query: { patientId, tab: value } },
      undefined,
      { shallow: true },
    );
  };

  if (query.isLoading || !patientId) return <LoadingState />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const patient = query.data!;

  return (
    <>
      <PatientHeader patient={patient} onEdit={editHandlers.open} />

      <Tabs value={tabParam} onChange={setTab} keepMounted={false}>
        <Tabs.List mb="lg">
          {PROFILE_TABS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="overview">
          <PatientOverviewTab patient={patient} onNavigateTab={setTab} />
        </Tabs.Panel>
        <Tabs.Panel value="dental">
          <DentalChart patientId={patientId} patientAge={patient.age} />
        </Tabs.Panel>
        <Tabs.Panel value="surface">
          <SurfaceChart patientId={patientId} patientAge={patient.age} />
        </Tabs.Panel>
        <Tabs.Panel value="gingival">
          <GingivalChart patientId={patientId} />
        </Tabs.Panel>
      </Tabs>

      <PatientFormModal
        opened={editOpened}
        onClose={editHandlers.close}
        mode="edit"
        patient={patient}
      />
    </>
  );
}
