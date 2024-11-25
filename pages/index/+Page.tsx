import { useData } from "vike-react/useData";
import React, { useEffect, useState } from "react";
import {
  addMinutes,
  format,
  formatDuration,
  intervalToDuration,
  isSameDay,
  startOfMinute,
  startOfWeek,
  differenceInMinutes,
  isSameMinute,
  isBefore,
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
  NavLink,
  Anchor,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IWorklog, WorkLocation } from "#/models";
import { PageData } from "./+data";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const formatWorkLocation = (location: WorkLocation): string => {
  switch (location) {
    case WorkLocation.HOME:
      return "Work at home";
    case WorkLocation.OFFICE:
      return "Work in the office";
    case WorkLocation.BUSINESS_TRIP:
      return "Business trip";
    default:
      return location;
  }
};

const formatTimeRange = (startTime: Date, endTime: Date | null): string => {
  if (!endTime) {
    return `Started from ${format(startTime, "MMM d p")}`;
  }

  if (isSameDay(startTime, endTime)) {
    return `${format(startTime, "MMM d")} ${format(startTime, "p")} - ${format(endTime, "p")}`;
  }

  return `${format(startTime, "MMM d")} ${format(startTime, "p")} - ${format(endTime, "MMM d")} ${format(endTime, "p")}`;
};

const formatBalanceDuration = (minutes: number): string => {
  const absMinutes = Math.abs(minutes);
  const hours = Math.floor(absMinutes / 60);
  const remainingMinutes = absMinutes % 60;

  return formatDuration(
    { hours, minutes: remainingMinutes },
    { format: ["hours", "minutes"] },
  );
};

const formatWeekRange = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Start week on Monday
  return `Week of ${format(weekStart, "MMM d")}`;
};

const calculateTotalDuration = (worklogs: IWorklog[]): number => {
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
  const [endTime, setEndTime] = useState<Date | null>(new Date());

  useEffect(() => {
    setEndTime(new Date());
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Mark Complete" size="sm">
      <Stack>
        <Text size="sm" fw={500}>
          End Time
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
            Now
          </Button>
          <Button
            variant={
              endTime && isSameMinute(endTime, addMinutes(new Date(), -5))
                ? "filled"
                : "light"
            }
            onClick={() => setEndTime(addMinutes(new Date(), -5))}
          >
            5m ago
          </Button>
          <Button
            variant={
              endTime && isSameMinute(endTime, addMinutes(new Date(), -15))
                ? "filled"
                : "light"
            }
            onClick={() => setEndTime(addMinutes(new Date(), -15))}
          >
            15m ago
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
            differenceInMinutes(startTime, endTime) <= 0
              ? formatDuration(
                  intervalToDuration({
                    start: startOfMinute(startTime),
                    end: startOfMinute(endTime),
                  }),
                )
              : "Invalid end time"}
          </Text>
        </Card>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!endTime) return;
              onConfirm(startOfMinute(endTime));
            }}
          >
            Complete
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
      title="Log Completed Work"
      size="sm"
    >
      <Stack>
        <Text size="sm" fw={500}>
          Start Time
        </Text>
        <DateTimePicker
          value={startTime}
          onChange={(date) => setStartTime(date)}
          clearable={false}
          maxDate={endTime || new Date()}
        />

        <Text size="sm" fw={500} mt="md">
          End Time
        </Text>
        <DateTimePicker
          value={endTime}
          onChange={(date) => setEndTime(date)}
          clearable={false}
          minDate={startTime ? addMinutes(startTime, 1) : undefined}
          maxDate={new Date()}
        />

        <Text size="sm" fw={500} mt="md">
          Location
        </Text>
        <Group grow>
          <Button
            variant={location === WorkLocation.HOME ? "filled" : "light"}
            onClick={() => setLocation(WorkLocation.HOME)}
          >
            Home
          </Button>
          <Button
            variant={location === WorkLocation.OFFICE ? "filled" : "light"}
            onClick={() => setLocation(WorkLocation.OFFICE)}
          >
            Office
          </Button>
          <Button
            variant={
              location === WorkLocation.BUSINESS_TRIP ? "filled" : "light"
            }
            onClick={() => setLocation(WorkLocation.BUSINESS_TRIP)}
          >
            Trip
          </Button>
        </Group>

        <TextInput
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          placeholder="What are you working on?"
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
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
            Log Work
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
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [location, setLocation] = useState<WorkLocation>(WorkLocation.HOME);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    setStartTime(new Date());
    setLocation(WorkLocation.HOME);
    setDescription("");
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Start New Work" size="sm">
      <Stack>
        <Text size="sm" fw={500}>
          Start Time
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
            Now
          </Button>
          <Button
            variant={
              startTime && isSameMinute(startTime, addMinutes(new Date(), -5))
                ? "filled"
                : "light"
            }
            onClick={() => setStartTime(addMinutes(new Date(), -5))}
          >
            5m ago
          </Button>
          <Button
            variant={
              startTime && isSameMinute(startTime, addMinutes(new Date(), -15))
                ? "filled"
                : "light"
            }
            onClick={() => setStartTime(addMinutes(new Date(), -15))}
          >
            15m ago
          </Button>
        </Group>
        <DateTimePicker
          value={startTime}
          onChange={(date) => setStartTime(date)}
          clearable={false}
          maxDate={new Date()}
        />

        <Text size="sm" fw={500} mt="md">
          Location
        </Text>
        <Group grow>
          <Button
            variant={location === WorkLocation.HOME ? "filled" : "light"}
            onClick={() => setLocation(WorkLocation.HOME)}
          >
            Home
          </Button>
          <Button
            variant={location === WorkLocation.OFFICE ? "filled" : "light"}
            onClick={() => setLocation(WorkLocation.OFFICE)}
          >
            Office
          </Button>
          <Button
            variant={
              location === WorkLocation.BUSINESS_TRIP ? "filled" : "light"
            }
            onClick={() => setLocation(WorkLocation.BUSINESS_TRIP)}
          >
            Trip
          </Button>
        </Group>

        <TextInput
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          placeholder="What are you working on?"
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
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
            Start Work
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export function Page() {
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
  const [creatingCompletedWork, setCreatingCompletedWork] = useState(false);
  const [selectedWorklogId, setSelectedWorklogId] = useState<string | null>(
    null,
  );

  const [worklogs, setWorklogs] = useState<IWorklog[]>(initialWorklogs);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialWorklogs.length < itemsPerPage ? false : true,
  );

  const fetchWorklogs = async (pageNum: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/worklogs?page=${pageNum}&limit=${itemsPerPage}`,
      );
      if (response.ok) {
        const data = (await response.json()) as ApiResponse<IWorklog[]>;
        if (data.success) {
          if (data.data.length < itemsPerPage) {
            setHasMore(false);
          }
          setWorklogs((prev) =>
            pageNum === 1 ? data.data : [...prev, ...data.data],
          );
        } else {
          notifications.show({
            color: "red",
            title: "Error",
            message: data.error || "Failed to fetch worklogs",
          });
        }
      } else {
        const errorData = await response.json();
        notifications.show({
          color: "red",
          title: "Error",
          message: errorData.error || "Failed to fetch worklogs",
        });
      }
    } catch (error) {
      console.error("Error fetching worklogs:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to fetch worklogs",
      });
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
      const response = await fetch(`/api/worklogs/${worklogId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endTime: endTime.toISOString(),
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as ApiResponse<IWorklog>;
        if (data.success) {
          setWorklogs((prev) =>
            prev.map((w) => (w.id === worklogId ? data.data : w)),
          );
          setInProgressWork(undefined);

          // Fetch latest worklogs and balance
          await Promise.all([
            // Fetch worklogs
            fetch(`/api/worklogs?page=1&limit=${itemsPerPage}`).then(
              async (worklogsResponse) => {
                if (worklogsResponse.ok) {
                  const worklogsData =
                    (await worklogsResponse.json()) as ApiResponse<IWorklog[]>;
                  if (worklogsData.success) {
                    setWorklogs(worklogsData.data);
                    setPage(1);
                    setHasMore(worklogsData.data.length === itemsPerPage);
                  } else {
                    notifications.show({
                      color: "red",
                      title: "Error",
                      message:
                        worklogsData.error || "Failed to refresh worklogs",
                    });
                  }
                } else {
                  const errorData = await worklogsResponse.json();
                  notifications.show({
                    color: "red",
                    title: "Error",
                    message: errorData.error || "Failed to refresh worklogs",
                  });
                }
              },
            ),
            // Fetch balance
            fetch("/api/balance").then(async (balanceResponse) => {
              if (balanceResponse.ok) {
                const balanceData =
                  (await balanceResponse.json()) as ApiResponse<number>;
                if (balanceData.success) {
                  setBalance(balanceData.data);
                } else {
                  notifications.show({
                    color: "red",
                    title: "Error",
                    message: balanceData.error || "Failed to refresh balance",
                  });
                }
              } else {
                const errorData =
                  (await balanceResponse.json()) as ApiResponse<undefined>;
                notifications.show({
                  color: "red",
                  title: "Error",
                  message: errorData.error || "Failed to refresh balance",
                });
              }
            }),
          ]);
        } else {
          notifications.show({
            color: "red",
            title: "Error",
            message: data.error || "Failed to complete work",
          });
        }
      } else {
        const errorData = await response.json();
        notifications.show({
          color: "red",
          title: "Error",
          message: errorData.error || "Failed to complete work",
        });
      }
    } catch (error) {
      console.error("Error completing worklog:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to complete work",
      });
    } finally {
      setCompletingWorklog(false);
      setMarkWorkCompleteModalOpen(false);
      setSelectedWorklogId(null);
    }
  };

  const cancelWork = async (worklogId: string) => {
    setCancellingWorklog(true);
    try {
      const response = await fetch(`/api/worklogs/${worklogId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const data = (await response.json()) as ApiResponse<void>;
        if (data.success) {
          setInProgressWork(undefined);
        } else {
          notifications.show({
            color: "red",
            title: "Error",
            message: data.error || "Failed to cancel work",
          });
        }
      } else {
        const errorData = await response.json();
        notifications.show({
          color: "red",
          title: "Error",
          message: errorData.error || "Failed to cancel work",
        });
      }
    } catch (error) {
      console.error("Error cancelling worklog:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to cancel work",
      });
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
      const response = await fetch("/api/worklogs/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          location,
          description,
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as ApiResponse<IWorklog>;
        if (data.success) {
          setInProgressWork(data.data);
        } else {
          notifications.show({
            color: "red",
            title: "Error",
            message: data.error || "Failed to start work",
          });
        }
      } else {
        const errorData = await response.json();
        notifications.show({
          color: "red",
          title: "Error",
          message: errorData.error || "Failed to start work",
        });
      }
    } catch (error) {
      console.error("Error starting work:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to start work",
      });
    } finally {
      setStartWorkModalOpen(false);
    }
  };

  const createCompletedWork = async (
    startTime: Date,
    endTime: Date,
    location: WorkLocation,
    description?: string,
  ) => {
    setCreatingCompletedWork(true);
    try {
      const response = await fetch("/api/worklogs/completed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          location,
          description,
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as ApiResponse<IWorklog>;
        if (data.success) {
          // Fetch latest worklogs and balance
          await Promise.all([
            // Fetch worklogs
            fetch(`/api/worklogs?page=1&limit=${itemsPerPage}`).then(
              async (worklogsResponse) => {
                if (worklogsResponse.ok) {
                  const worklogsData =
                    (await worklogsResponse.json()) as ApiResponse<IWorklog[]>;
                  if (worklogsData.success) {
                    setWorklogs(worklogsData.data);
                    setPage(1);
                    setHasMore(worklogsData.data.length === itemsPerPage);
                  } else {
                    notifications.show({
                      color: "red",
                      title: "Error",
                      message:
                        worklogsData.error || "Failed to refresh worklogs",
                    });
                  }
                } else {
                  const errorData = await worklogsResponse.json();
                  notifications.show({
                    color: "red",
                    title: "Error",
                    message: errorData.error || "Failed to refresh worklogs",
                  });
                }
              },
            ),
            // Fetch balance
            fetch("/api/balance").then(async (balanceResponse) => {
              if (balanceResponse.ok) {
                const balanceData =
                  (await balanceResponse.json()) as ApiResponse<number>;
                if (balanceData.success) {
                  setBalance(balanceData.data);
                } else {
                  notifications.show({
                    color: "red",
                    title: "Error",
                    message: balanceData.error || "Failed to refresh balance",
                  });
                }
              } else {
                const errorData = await balanceResponse.json();
                notifications.show({
                  color: "red",
                  title: "Error",
                  message: errorData.error || "Failed to refresh balance",
                });
              }
            }),
          ]);
        } else {
          notifications.show({
            color: "red",
            title: "Error",
            message: data.error || "Failed to create completed work",
          });
        }
      } else {
        const errorData = await response.json();
        notifications.show({
          color: "red",
          title: "Error",
          message: errorData.error || "Failed to create completed work",
        });
      }
    } catch (error) {
      console.error("Error creating completed work:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create completed work",
      });
    } finally {
      setCreatingCompletedWork(false);
      setCreateCompletedModalOpen(false);
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
        Overwork Monitor
      </Title>

      <Stack mt="xl">
        {/* Current Balance */}
        <Card withBorder padding="lg" h="100%" shadow="sm">
          <Stack>
            <Group justify="space-between" align="center">
              <Text size="lg" fw={500}>
                Time Remaining
              </Text>
              <Anchor size="sm" c="dimmed" href="/history">
                View History
              </Anchor>
            </Group>
            <Text size="xl" fw={700} c={balance >= 9 * 60 ? "green" : "red"}>
              {(balance < 0 ? "-" : "") +
                formatBalanceDuration(Math.abs(balance))}
            </Text>
            {!inProgressWork && (
              <Group mt="md">
                <Button radius="md" onClick={() => setStartWorkModalOpen(true)}>
                  Start New Work
                </Button>
                <Button
                  variant="light"
                  radius="md"
                  onClick={() => setCreateCompletedModalOpen(true)}
                >
                  Log Completed Work
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
                  {formatWorkLocation(inProgressWork.location)} on{" "}
                  {format(inProgressWork.startTime, "EEEE")}
                </Text>
                <Badge color="blue" variant="light" size="sm">
                  In progress
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                {inProgressWork.description}
              </Text>
              <Text size="sm" c="dimmed">
                {formatTimeRange(inProgressWork.startTime, null)}
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
                  Mark as Complete
                </Button>
                <Button
                  variant="light"
                  color="red"
                  radius="md"
                  onClick={() => void cancelWork(inProgressWork.id)}
                  loading={cancellingWorklog}
                >
                  Cancel
                </Button>
              </Group>
            </Stack>
          </Card>
        )}

        {/* Recent Worklogs */}
        <Stack mt="lg">
          <Title order={3}>Recent Worklogs</Title>
          <Stack>
            {Object.entries(worklogsByWeek)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([weekKey, weekLogs]) => {
                if (weekLogs.length === 0) return null;

                return (
                  <Stack key={weekKey} gap="xs">
                    <Group justify="space-between" align="center">
                      <Text fw={500} c="dimmed" size="sm">
                        {formatWeekRange(new Date(weekKey))}
                      </Text>
                      <Text c="dimmed" size="sm">
                        Total:{" "}
                        {formatBalanceDuration(
                          calculateTotalDuration(weekLogs),
                        )}
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
                                  {formatWorkLocation(location)} on{" "}
                                  {format(startTime, "EEEE")}
                                </Text>
                                {endTime && (
                                  <Text c="dimmed">
                                    {formatDuration(
                                      intervalToDuration({
                                        start: startTime,
                                        end: endTime,
                                      }),
                                    )}
                                  </Text>
                                )}
                              </Group>
                              <Text size="sm" c="dimmed">
                                {worklog.description}
                              </Text>
                              <Text size="sm" c="dimmed">
                                {formatTimeRange(startTime, endTime)}
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
                Load more
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
          void createCompletedWork(startTime, endTime, location, description)
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
