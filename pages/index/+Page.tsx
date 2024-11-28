import { useData } from "vike-react/useData";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  addMinutes,
  isSameDay,
  startOfMinute,
  startOfWeek,
  differenceInMinutes,
  isSameMinute,
} from "date-fns";
import {
  Container,
  Title,
  Text,
  Badge,
  Loader,
  Center,
  Button,
  Modal,
  Stack,
  Card,
  Group,
  TextInput,
  Anchor,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IWorklog, WorkLocation, WorklogStatus } from "#/models";
import { PageData } from "./+data";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const formatWorkLocation = (location: WorkLocation): string => {
  switch (location) {
    case WorkLocation.HOME:
      return "work_at_home";
    case WorkLocation.OFFICE:
      return "work_in_office";
    case WorkLocation.BUSINESS_TRIP:
      return "business_trip";
    default:
      return location;
  }
};

const TimeRange: React.FC<{ startTime: Date; endTime: Date | null }> = ({
  startTime,
  endTime,
}) => {
  const { t } = useTranslation();

  if (!endTime) {
    return t("started_from", { startTime });
  }

  if (isSameDay(startTime, endTime)) {
    return t("same_day_start_end", { startTime, endTime });
  }

  return t("different_day_start_end", { startTime, endTime });
};

const WorkLocationDisplay: React.FC<{ location: WorkLocation; date: Date }> = ({
  location,
  date,
}) => {
  const { t } = useTranslation();
  return t("work_location_on_day", {
    location: t(formatWorkLocation(location)),
    date,
  });
};

const Duration: React.FC<{ totalMinutes: number }> = ({ totalMinutes }) => {
  const { t } = useTranslation();
  if (totalMinutes < 60) {
    return t("minutes", { minutes: totalMinutes });
  } else if (totalMinutes % 60 === 0) {
    return t("hours", { hours: totalMinutes / 60 });
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return t("hours_and_minutes", { hours, minutes });
  }
};

const calculateTotalMinutes = (worklogs: IWorklog[]): number => {
  return worklogs.reduce((total, worklog) => {
    if (!worklog.endTime) return total;
    const duration = differenceInMinutes(
      new Date(worklog.endTime),
      new Date(worklog.startTime),
    );
    return total + duration;
  }, 0);
};

const MarkWorkCompleteModal = ({
  opened,
  startTime,
  onClose,
  onConfirm,
}: {
  opened: boolean;
  startTime?: Date;
  onClose: () => void;
  onConfirm: (endTime: Date) => void;
}) => {
  const { t } = useTranslation();
  const [endTime, setEndTime] = useState<Date | null>(new Date());

  useEffect(() => {
    setEndTime(new Date());
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("mark_complete")}
      size="sm"
    >
      <Stack>
        <Text size="sm" fw={500}>
          {t("end_time")}
        </Text>
        <Group grow>
          <Button
            variant={
              endTime && isSameMinute(endTime, addMinutes(new Date(), -0))
                ? "filled"
                : "light"
            }
            onClick={() => setEndTime(new Date())}
          >
            {t("now")}
          </Button>
          <Button
            variant={
              endTime && isSameMinute(endTime, addMinutes(new Date(), -5))
                ? "filled"
                : "light"
            }
            onClick={() => setEndTime(addMinutes(new Date(), -5))}
          >
            {t("minutes_ago", { count: 5 })}
          </Button>
          <Button
            variant={
              endTime && isSameMinute(endTime, addMinutes(new Date(), -15))
                ? "filled"
                : "light"
            }
            onClick={() => setEndTime(addMinutes(new Date(), -15))}
          >
            {t("minutes_ago", { count: 15 })}
          </Button>
        </Group>
        <DateTimePicker
          value={endTime}
          onChange={(date) => setEndTime(date)}
          clearable={false}
          maxDate={new Date()}
          minDate={startTime ? addMinutes(startTime, 1) : undefined}
        />

        <Card mt="md" p="md" bg="lime.0">
          <Text ta="center">
            {startTime &&
            endTime &&
            differenceInMinutes(endTime, startTime) > 0 ? (
              <Duration
                totalMinutes={differenceInMinutes(
                  startOfMinute(endTime),
                  startOfMinute(startTime),
                )}
              />
            ) : (
              t("invalid_end_time")
            )}
          </Text>
        </Card>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => {
              if (!endTime) return;
              onConfirm(startOfMinute(endTime));
            }}
          >
            {t("complete")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

const LogCompletedWorkModal = ({
  opened,
  onClose,
  onConfirm,
}: {
  opened: boolean;
  onClose: () => void;
  onConfirm: (
    startTime: Date,
    endTime: Date,
    location: WorkLocation,
    description?: string,
  ) => void;
}) => {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<WorkLocation>(WorkLocation.HOME);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    setStartTime(null);
    setEndTime(null);
    setLocation(WorkLocation.HOME);
    setDescription("");
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("log_completed_work")}
      size="sm"
    >
      <Stack>
        <Text size="sm" fw={500}>
          {t("start_time")}
        </Text>
        <DateTimePicker
          value={startTime}
          onChange={(date) => setStartTime(date)}
          clearable={false}
          maxDate={endTime || new Date()}
        />

        <Text size="sm" fw={500} mt="md">
          {t("end_time")}
        </Text>
        <DateTimePicker
          value={endTime}
          onChange={(date) => setEndTime(date)}
          clearable={false}
          minDate={startTime ? addMinutes(startTime, 1) : undefined}
          maxDate={new Date()}
        />

        <Text size="sm" fw={500} mt="md">
          {t("location")}
        </Text>
        <Group grow>
          <Button
            variant={location === WorkLocation.HOME ? "filled" : "light"}
            onClick={() => setLocation(WorkLocation.HOME)}
          >
            {t("home")}
          </Button>
          <Button
            variant={location === WorkLocation.OFFICE ? "filled" : "light"}
            onClick={() => setLocation(WorkLocation.OFFICE)}
          >
            {t("office")}
          </Button>
          <Button
            variant={
              location === WorkLocation.BUSINESS_TRIP ? "filled" : "light"
            }
            onClick={() => setLocation(WorkLocation.BUSINESS_TRIP)}
          >
            {t("trip")}
          </Button>
        </Group>

        <TextInput
          label={t("description")}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          placeholder={t("description_placeholder")}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => {
              if (!startTime || !endTime) return;
              onConfirm(
                startOfMinute(startTime),
                startOfMinute(endTime),
                location,
                description || undefined,
              );
            }}
          >
            {t("log_work")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

const StartWorkModal = ({
  opened,
  onClose,
  onConfirm,
}: {
  opened: boolean;
  onClose: () => void;
  onConfirm: (
    startTime: Date,
    location: WorkLocation,
    description?: string,
  ) => void;
}) => {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [location, setLocation] = useState<WorkLocation>(WorkLocation.HOME);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    setStartTime(new Date());
    setLocation(WorkLocation.HOME);
    setDescription("");
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("start_new_work")}
      size="sm"
    >
      <Stack>
        <Text size="sm" fw={500}>
          {t("start_time")}
        </Text>
        <Group grow>
          <Button
            variant={
              startTime && isSameMinute(startTime, addMinutes(new Date(), -0))
                ? "filled"
                : "light"
            }
            onClick={() => setStartTime(new Date())}
          >
            {t("now")}
          </Button>
          <Button
            variant={
              startTime && isSameMinute(startTime, addMinutes(new Date(), -5))
                ? "filled"
                : "light"
            }
            onClick={() => setStartTime(addMinutes(new Date(), -5))}
          >
            {t("minutes_ago", { count: 5 })}
          </Button>
          <Button
            variant={
              startTime && isSameMinute(startTime, addMinutes(new Date(), -15))
                ? "filled"
                : "light"
            }
            onClick={() => setStartTime(addMinutes(new Date(), -15))}
          >
            {t("minutes_ago", { count: 15 })}
          </Button>
        </Group>
        <DateTimePicker
          value={startTime}
          onChange={(date) => setStartTime(date)}
          clearable={false}
          maxDate={new Date()}
        />

        <Text size="sm" fw={500} mt="md">
          {t("location")}
        </Text>
        <Group grow>
          <Button
            variant={location === WorkLocation.HOME ? "filled" : "light"}
            onClick={() => setLocation(WorkLocation.HOME)}
          >
            {t("home")}
          </Button>
          <Button
            variant={location === WorkLocation.OFFICE ? "filled" : "light"}
            onClick={() => setLocation(WorkLocation.OFFICE)}
          >
            {t("office")}
          </Button>
          <Button
            variant={
              location === WorkLocation.BUSINESS_TRIP ? "filled" : "light"
            }
            onClick={() => setLocation(WorkLocation.BUSINESS_TRIP)}
          >
            {t("trip")}
          </Button>
        </Group>

        <TextInput
          label={t("description")}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          placeholder={t("description_placeholder")}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => {
              if (!startTime) return;
              onConfirm(
                startOfMinute(startTime),
                location,
                description || undefined,
              );
            }}
          >
            {t("start_work")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export function Page() {
  const { t } = useTranslation();

  const {
    worklogs: initialWorklogs,
    inProgressWork: initialInProgressWork,
    balance: initialBalance,
    itemsPerPage,
  } = useData<PageData>();
  const [balance, setBalance] = useState<number>(initialBalance);

  const [inProgressWork, setInProgressWork] = useState<IWorklog | undefined>(
    initialInProgressWork,
  );
  const [completingWorklog, setCompletingWorklog] = useState<boolean>(false);
  const [cancellingWorklog, setCancellingWorklog] = useState(false);
  const [markWorkCompleteModalOpen, setMarkWorkCompleteModalOpen] =
    useState(false);
  const [startWorkModalOpen, setStartWorkModalOpen] = useState(false);
  const [createCompletedModalOpen, setCreateCompletedModalOpen] =
    useState(false);
  const [selectedWorklogId, setSelectedWorklogId] = useState<string | null>(
    null,
  );

  const [worklogs, setWorklogs] = useState<IWorklog[]>(initialWorklogs);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialWorklogs.length < itemsPerPage ? false : true,
  );

  const request = async <T,>(
    url: string,
    method = "GET",
    body?: unknown,
  ): Promise<T> => {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.ok) {
      const data = (await response.json()) as ApiResponse<T>;
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || t("unknown_server_error"));
      }
    } else {
      throw new Error(t("request_failed", { status: response.statusText }));
    }
  };

  const showError = (error: unknown) => {
    notifications.show({
      color: "red",
      title: t("error"),
      message: error instanceof Error ? error.message : String(error),
    });
  };

  const fetchWorklogs = async (pageNum: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const worklogs = await request<IWorklog[]>(
        `/api/worklogs?page=${pageNum}&limit=${itemsPerPage}&status=${WorklogStatus.COMPLETED}`,
      );
      if (worklogs.length < itemsPerPage) {
        setHasMore(false);
      }
      setWorklogs((prev) => [...prev, ...worklogs]);
    } catch (error) {
      console.error("Error fetching worklogs:", error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      void fetchWorklogs(nextPage);
    }
  };

  const completeWork = async (worklogId: string, endTime: Date) => {
    setCompletingWorklog(true);
    try {
      const worklog = await request<IWorklog>(
        `/api/worklogs/${worklogId}/complete`,
        "POST",
        {
          endTime: endTime.toISOString(),
        },
      );

      setWorklogs((prev) =>
        prev.map((w) => (w.id === worklogId ? worklog : w)),
      );
      setInProgressWork(undefined);

      // Refresh data
      const [refreshedWorklogs, newBalance] = await Promise.all([
        request<IWorklog[]>(`/api/worklogs?page=1&limit=${itemsPerPage}`),
        request<number>("/api/balance"),
      ]);

      setWorklogs(refreshedWorklogs);
      setBalance(newBalance);
      setPage(1);
      setHasMore(refreshedWorklogs.length === itemsPerPage);
    } catch (error) {
      console.error("Error completing worklog:", error);
      showError(error);
    } finally {
      setCompletingWorklog(false);
      setMarkWorkCompleteModalOpen(false);
      setSelectedWorklogId(null);
    }
  };

  const cancelWork = async (worklogId: string) => {
    setCancellingWorklog(true);
    try {
      await request(`/api/worklogs/${worklogId}`, "DELETE");
      setInProgressWork(undefined);
    } catch (error) {
      console.error("Error cancelling worklog:", error);
      showError(error);
    } finally {
      setCancellingWorklog(false);
    }
  };

  const startWork = async (
    startTime: Date,
    location: WorkLocation,
    description?: string,
  ) => {
    try {
      const worklog = await request<IWorklog>("/api/worklogs/start", "POST", {
        startTime: startTime.toISOString(),
        location,
        description,
      });
      setInProgressWork(worklog);
    } catch (error) {
      console.error("Error starting work:", error);
      showError(error);
    }
  };

  const logCompletedWork = async (
    startTime: Date,
    endTime: Date,
    location: WorkLocation,
    description?: string,
  ) => {
    try {
      const worklog = await request<IWorklog>("/api/worklogs", "POST", {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location,
        description,
      });
      setWorklogs((prev) => [worklog, ...prev]);
    } catch (error) {
      console.error("Error logging completed work:", error);
      showError(error);
    }
  };

  // Group worklogs by week
  const worklogsByWeek = worklogs.reduce(
    (acc, worklog) => {
      const startTime = new Date(worklog.startTime);
      const weekStart = startOfWeek(startTime, { weekStartsOn: 1 });
      const weekKey = weekStart.toISOString();

      if (!acc[weekKey]) {
        acc[weekKey] = [];
      }
      acc[weekKey].push(worklog);
      return acc;
    },
    {} as Record<string, IWorklog[]>,
  );

  return (
    <Container size="sm" py="xl">
      <Title order={2} size="h1" fw={900} ta="center">
        {t("overtime_tracker")}
      </Title>

      <Stack mt="xl">
        {/* Current Balance */}
        <Card withBorder padding="lg" h="100%" shadow="sm">
          <Stack>
            <Group justify="space-between" align="center">
              <Text size="lg" fw={500}>
                {t("time_remaining")}
              </Text>
              <Anchor size="sm" c="dimmed" href="/history">
                {t("view_history")}
              </Anchor>
            </Group>
            <Text size="xl" fw={700} c={balance >= 9 * 60 ? "green" : "red"}>
              {balance < 0 ? "-" : ""}
              <Duration totalMinutes={Math.abs(balance)} />
            </Text>
            {!inProgressWork && (
              <Group mt="md">
                <Button radius="md" onClick={() => setStartWorkModalOpen(true)}>
                  {t("start_new_work")}
                </Button>
                <Button
                  variant="light"
                  radius="md"
                  onClick={() => setCreateCompletedModalOpen(true)}
                >
                  {t("log_completed_work")}
                </Button>
              </Group>
            )}
          </Stack>
        </Card>

        {/* In Progress Work */}
        {inProgressWork && (
          <Card bg="lime.0" withBorder padding="lg" h="100%" shadow="sm">
            <Stack h="100%" justify="space-between" gap="xs">
              <Group justify="space-between" align="center">
                <Text size="lg" fw={500}>
                  <WorkLocationDisplay
                    location={inProgressWork.location}
                    date={inProgressWork.startTime}
                  />
                </Text>
                <Badge color="blue" variant="light" size="sm">
                  {t("in_progress")}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {inProgressWork.description}
              </Text>
              <Text size="sm" c="dimmed">
                <TimeRange
                  startTime={inProgressWork.startTime}
                  endTime={null}
                />
              </Text>
              <Group mt="md">
                <Button
                  radius="md"
                  onClick={() => {
                    setSelectedWorklogId(inProgressWork.id);
                    setMarkWorkCompleteModalOpen(true);
                  }}
                  loading={completingWorklog}
                >
                  {t("mark_as_complete")}
                </Button>
                <Button
                  variant="light"
                  color="red"
                  radius="md"
                  onClick={() => void cancelWork(inProgressWork.id)}
                  loading={cancellingWorklog}
                >
                  {t("cancel")}
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {/* Recent Worklogs */}
        <Stack mt="lg">
          <Title order={3}>{t("recent_worklogs")}</Title>
          <Stack>
            {Object.entries(worklogsByWeek)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([weekKey, weekLogs]) => {
                if (weekLogs.length === 0) return null;

                return (
                  <Stack key={weekKey} gap="xs">
                    <Group justify="space-between" align="center">
                      <Text fw={500} c="dimmed" size="sm">
                        {t("week_of", { date: new Date(weekKey) })}
                      </Text>
                      <Text c="dimmed" size="sm">
                        {t("total")}
                        <Duration
                          totalMinutes={calculateTotalMinutes(weekLogs)}
                        />
                      </Text>
                    </Group>
                    <Stack gap="md">
                      {weekLogs.map((worklog) => {
                        const location = worklog.location;
                        const startTime = new Date(worklog.startTime);
                        const endTime = worklog.endTime
                          ? new Date(worklog.endTime)
                          : null;

                        return (
                          <Card
                            key={worklog.id}
                            withBorder
                            p="md"
                            radius="md"
                            shadow="sm"
                          >
                            <Stack gap="xs">
                              <Group justify="space-between" align="center">
                                <Text size="lg">
                                  <WorkLocationDisplay
                                    location={location}
                                    date={startTime}
                                  />
                                </Text>
                                {endTime && (
                                  <Text c="dimmed">
                                    <Duration
                                      totalMinutes={differenceInMinutes(
                                        startOfMinute(endTime),
                                        startOfMinute(startTime),
                                      )}
                                    />
                                  </Text>
                                )}
                              </Group>
                              <Text size="sm" c="dimmed">
                                {worklog.description}
                              </Text>
                              <Text size="sm" c="dimmed">
                                <TimeRange
                                  startTime={startTime}
                                  endTime={endTime}
                                />
                              </Text>
                            </Stack>
                          </Card>
                        );
                      })}
                    </Stack>
                  </Stack>
                );
              })}
          </Stack>

          {loading && (
            <Center>
              <Loader size="sm" />
            </Center>
          )}

          {!loading && hasMore && (
            <Center>
              <Text
                component="button"
                onClick={loadMore}
                c="blue"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t("load_more")}
              </Text>
            </Center>
          )}
        </Stack>
      </Stack>
      <MarkWorkCompleteModal
        opened={markWorkCompleteModalOpen}
        startTime={inProgressWork?.startTime}
        onClose={() => {
          setMarkWorkCompleteModalOpen(false);
          setSelectedWorklogId(null);
        }}
        onConfirm={(endTime) => {
          if (selectedWorklogId) {
            void completeWork(selectedWorklogId, endTime);
          }
        }}
      />
      <LogCompletedWorkModal
        opened={createCompletedModalOpen}
        onClose={() => setCreateCompletedModalOpen(false)}
        onConfirm={(startTime, endTime, location, description) =>
          void logCompletedWork(startTime, endTime, location, description)
        }
      />
      <StartWorkModal
        opened={startWorkModalOpen}
        onClose={() => setStartWorkModalOpen(false)}
        onConfirm={(startTime, location, description) =>
          void startWork(startTime, location, description)
        }
      />
    </Container>
  );
}
