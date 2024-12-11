import { useData } from "vike-react/useData";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { IWorklog, WorkLocation, WorklogStatus } from "#/types";
import { Button, DateTimeInput, Modal, ToggleGroup } from "#/components";
import { useTranslation } from "#/hooks/useTranslation";
import { useToaster } from "#/hooks/useToaster";
import { PageData } from "./+data";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

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
  const data = (await response.json()) as ApiResponse<T>;
  if (!data.success || !response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`,
    );
  }
  return data.data;
};

const calculateTotalMinutes = (worklogs: IWorklog[]): number => {
  return worklogs.reduce((total, worklog) => {
    if (!worklog.endTime) return total;
    const duration = dayjs(worklog.endTime).diff(worklog.startTime, "minutes");
    return total + duration;
  }, 0);
};

const TimeRange = ({
  startTime,
  endTime,
}: {
  startTime: Date;
  endTime?: Date | null;
}) => {
  const { t } = useTranslation();

  if (!endTime) {
    return t("started_from", { startTime });
  }

  if (dayjs(startTime).isSame(endTime, "day")) {
    return t("same_day_start_end", { startTime, endTime });
  }

  return t("different_day_start_end", { startTime, endTime });
};

const WorkSummary = ({
  location,
  date,
}: {
  location: WorkLocation;
  date: Date;
}) => {
  const { t } = useTranslation();

  const keys = {
    [WorkLocation.HOME]: "work_at_home",
    [WorkLocation.OFFICE]: "work_in_office",
    [WorkLocation.BUSINESS_TRIP]: "business_trip",
  };

  return t("work_location_on_day", {
    location: t(keys[location]),
    date,
  });
};

const Duration = ({ totalMinutes }: { totalMinutes: number }) => {
  const { t } = useTranslation();

  let output = "";
  if (totalMinutes < 0) {
    output += "- ";
  }

  totalMinutes = Math.abs(totalMinutes);

  if (totalMinutes < 60) {
    output += t("minutes", { minutes: totalMinutes });
  } else if (totalMinutes % 60 === 0) {
    output += t("hours", { hours: totalMinutes / 60 });
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    output += t("hours_and_minutes", { hours, minutes });
  }

  return output;
};

const TimeQuickSelect = ({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
}) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<string>();

  const options = useMemo(
    () => [
      { value: "0", label: t("now") },
      { value: "-5", label: t("minutes_ago", { count: 5 }) },
      { value: "-15", label: t("minutes_ago", { count: 15 }) },
    ],
    [t],
  );

  const onValueChange = (value: string) => {
    setSelectedOption(value);
    const minutes = parseInt(value);
    const date = dayjs().add(minutes, "minutes").startOf("minute").toDate();
    onChange(date);
  };

  useEffect(() => {
    if (value) {
      const now = new Date();
      const diff = dayjs(value).diff(now, "minutes");
      setSelectedOption(options.find((o) => o.value === String(diff))?.value);
    }
  }, [value, options]);

  return (
    <ToggleGroup
      value={selectedOption}
      onValueChange={onValueChange}
      options={options}
    />
  );
};

const WorkLocationQuickSelect = ({
  value,
  onChange,
}: {
  value: WorkLocation;
  onChange: (location: WorkLocation) => void;
}) => {
  const { t } = useTranslation();

  const options = [
    { value: WorkLocation.HOME, label: t("home") },
    { value: WorkLocation.OFFICE, label: t("office") },
    { value: WorkLocation.BUSINESS_TRIP, label: t("business_trip") },
  ];

  const onValueChange = (value: string) => {
    onChange(value as WorkLocation);
  };

  return (
    <ToggleGroup
      value={value}
      onValueChange={onValueChange}
      options={options}
    />
  );
};

const StartWorkModal = ({
  opened,
  onClose,
  onConfirm,
}: {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [location, setLocation] = useState<WorkLocation>(WorkLocation.HOME);
  const [description, setDescription] = useState<string>("");
  const [startingWork, setStartingWork] = useState(false);

  useEffect(() => {
    setStartTime(new Date());
    setLocation(WorkLocation.HOME);
    setDescription("");
  }, [opened]);

  const startWork = async () => {
    if (!startTime) return;
    setStartingWork(true);
    try {
      await request<IWorklog>("/api/worklogs/start", "POST", {
        startTime: dayjs(startTime).startOf("minute").toDate(),
        location,
        description: description || undefined,
      });
      onConfirm();
    } catch (error) {
      console.error("Error starting work:", error);
      // showError(error);
    } finally {
      setStartingWork(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t("start_new_work")}>
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium">{t("start_time")}</span>
        <div className="flex grow">
          <TimeQuickSelect value={startTime} onChange={setStartTime} />
        </div>
        <DateTimeInput
          value={startTime}
          onChange={setStartTime}
          max={new Date()}
        />

        <span className="text-sm font-medium mt-4">{t("location")}</span>
        <div className="flex grow">
          <WorkLocationQuickSelect value={location} onChange={setLocation} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {t("description")}
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            placeholder={t("description_placeholder")}
          />
        </div>

        <div className="flex gap-4 justify-end mt-4">
          <Button loading={startingWork} onClick={() => void startWork()}>
            {t("start_work")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const MarkWorkCompleteModal = ({
  opened,
  worklog,
  onClose,
  onConfirm,
}: {
  opened: boolean;
  worklog?: IWorklog;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToaster();
  const [endTime, setEndTime] = useState<Date | null>(new Date());
  const [completingWorklog, setCompletingWorklog] = useState(false);

  useEffect(() => {
    setEndTime(new Date());
  }, [opened]);

  const markWorkComplete = async () => {
    if (!worklog || !endTime) return;

    setCompletingWorklog(true);
    try {
      await request<IWorklog>(`/api/worklogs/${worklog.id}/complete`, "POST", {
        endTime: dayjs(endTime).startOf("minute").toDate(),
      });
      onConfirm();
    } catch (error) {
      console.error("Error completing worklog:", error);
      toast(error instanceof Error ? error.message : "An error occurred");
      // showError(error);
    } finally {
      setCompletingWorklog(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t("mark_complete")}>
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium">{t("end_time")}</span>
        <div className="flex grow">
          <TimeQuickSelect value={endTime} onChange={setEndTime} />
        </div>
        <DateTimeInput
          value={endTime}
          onChange={setEndTime}
          max={new Date()}
          min={
            worklog?.startTime
              ? dayjs(worklog.startTime).add(1, "minute").toDate()
              : undefined
          }
        />

        {worklog?.startTime && endTime && (
          <div className="mt-4 p-4 bg-lime-50 text-center">
            <Duration
              totalMinutes={dayjs(endTime)
                .startOf("minute")
                .diff(dayjs(worklog.startTime).startOf("minute"), "minutes")}
            />
          </div>
        )}

        <div className="flex gap-4 justify-end mt-4">
          <Button
            onClick={() => void markWorkComplete()}
            loading={completingWorklog}
          >
            {t("complete")}
          </Button>
        </div>
      </div>
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
  onConfirm: () => void;
}) => {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<WorkLocation>(WorkLocation.HOME);
  const [description, setDescription] = useState<string>("");
  const [loggingWork, setLoggingWork] = useState(false);

  const logWork = async () => {
    if (!startTime || !endTime) return;

    setLoggingWork(true);
    try {
      await request<IWorklog>("/api/worklogs", "POST", {
        startTime: dayjs(startTime).startOf("minute").toDate(),
        endTime: dayjs(endTime).startOf("minute").toDate(),
        location,
        description: description || undefined,
      });
      onConfirm();
    } catch (error) {
      console.error("Error logging completed work:", error);
      // showError(error);
    } finally {
      setLoggingWork(false);
    }
  };

  useEffect(() => {
    setStartTime(null);
    setEndTime(null);
    setLocation(WorkLocation.HOME);
    setDescription("");
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title={t("log_completed_work")}>
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium">{t("start_time")}</span>
        <DateTimeInput
          value={startTime}
          onChange={setStartTime}
          max={endTime || new Date()}
        />

        <span className="text-sm font-medium mt-4">{t("end_time")}</span>
        <DateTimeInput
          value={endTime}
          onChange={setEndTime}
          min={
            startTime ? dayjs(startTime).add(1, "minute").toDate() : undefined
          }
          max={new Date()}
        />

        <span className="text-sm font-medium mt-4">{t("location")}</span>
        <div className="flex grow">
          <WorkLocationQuickSelect value={location} onChange={setLocation} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {t("description")}
          </label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            placeholder={t("description_placeholder")}
          />
        </div>

        {startTime && endTime && (
          <div className="mt-4 p-4 bg-lime-50 text-center">
            <Duration
              totalMinutes={dayjs(endTime)
                .startOf("minute")
                .diff(dayjs(startTime).startOf("minute"), "minutes")}
            />
          </div>
        )}

        <div className="flex gap-4 justify-end mt-4">
          <Button onClick={() => void logWork()} loading={loggingWork}>
            {t("log_work")}
          </Button>
        </div>
      </div>
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

  const [worklogs, setWorklogs] = useState<IWorklog[]>(initialWorklogs);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialWorklogs.length < itemsPerPage ? false : true,
  );

  const [cancelingWorklog, setCancelingWork] = useState(false);

  const [markWorkCompleteModalOpen, setMarkWorkCompleteModalOpen] =
    useState(false);
  const [startWorkModalOpen, setStartWorkModalOpen] = useState(false);
  const [logCompletedWorkModalOpen, setLogCompletedWorkModalOpen] =
    useState(false);

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
      // showError(error);
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

  const refreshData = async () => {
    // Refresh data
    const [completedWorklogs, [inProgressWork], { balance }] =
      await Promise.all([
        request<IWorklog[]>(
          `/api/worklogs?page=1&limit=${itemsPerPage}&status=${WorklogStatus.COMPLETED}`,
        ),
        request<IWorklog[]>(
          `/api/worklogs?page=1&limit=1&status=${WorklogStatus.IN_PROGRESS}`,
        ),
        request<{ balance: number }>("/api/balance"),
      ]);

    setWorklogs(completedWorklogs);
    setPage(1);
    setHasMore(completedWorklogs.length === itemsPerPage);
    setInProgressWork(inProgressWork);
    setBalance(balance);
  };

  const cancelWork = async (worklogId: string) => {
    setCancelingWork(true);
    try {
      await request(`/api/worklogs/${worklogId}`, "DELETE");
      void refreshData();
    } catch (error) {
      console.error("Error cancelling worklog:", error);
      // showError(error);
    } finally {
      setCancelingWork(false);
    }
  };

  // Group worklogs by week
  const worklogsByWeek = worklogs.reduce(
    (acc, worklog) => {
      const startTime = new Date(worklog.startTime);
      const weekStart = dayjs(startTime).startOf("week");
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
    <div className="container mx-auto px-4 max-w-[680px] py-8">
      <h1 className="text-3xl font-black text-center">
        {t("overtime_tracker")}
      </h1>

      <div className="mt-8 flex flex-col gap-4">
        {/* Current Balance */}
        <div className="border border-slate-300 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="text-lg font-medium">{t("time_remaining")}</div>
            <div
              className={`text-xl font-bold ${balance >= 9 * 60 ? "text-green-500" : "text-red-500"}`}
            >
              <Duration totalMinutes={balance} />
            </div>
            {!inProgressWork && (
              <div className="mt-4 flex gap-4">
                <Button onClick={() => setStartWorkModalOpen(true)}>
                  {t("start_new_work")}
                </Button>
                <Button
                  variant="light"
                  onClick={() => setLogCompletedWorkModalOpen(true)}
                >
                  {t("log_completed_work")}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* In Progress Work */}
        {inProgressWork && (
          <div className="bg-lime-50 border border-lime-100 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col gap-2 justify-between h-full">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">
                  <WorkSummary
                    location={inProgressWork.location}
                    date={inProgressWork.startTime}
                  />
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-500 uppercase">
                  {t("in_progress")}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {inProgressWork.description}
              </span>
              <span className="text-sm text-gray-500">
                <TimeRange startTime={inProgressWork.startTime} />
              </span>
              <div className="mt-4 flex gap-4">
                <Button onClick={() => setMarkWorkCompleteModalOpen(true)}>
                  {t("mark_as_complete")}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => void cancelWork(inProgressWork.id)}
                  disabled={cancelingWorklog}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Worklogs */}
        <div className="mt-8 flex flex-col gap-4">
          <h2 className="text-2xl font-bold">{t("recent_worklogs")}</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(worklogsByWeek)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([weekKey, weekLogs]) => {
                if (weekLogs.length === 0) return null;

                return (
                  <div key={weekKey} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        {t("week_of", { date: new Date(weekKey) })}
                      </span>
                      <span className="text-sm text-gray-500">
                        {t("total")}
                        <Duration
                          totalMinutes={calculateTotalMinutes(weekLogs)}
                        />
                      </span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {weekLogs.map((worklog) => {
                        const location = worklog.location;
                        const startTime = new Date(worklog.startTime);
                        const endTime = worklog.endTime
                          ? new Date(worklog.endTime)
                          : null;

                        return (
                          <div
                            key={worklog.id}
                            className="border border-slate-300 rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-lg">
                                  <WorkSummary
                                    location={location}
                                    date={startTime}
                                  />
                                </span>
                                {endTime && (
                                  <span className="text-gray-500">
                                    <Duration
                                      totalMinutes={dayjs(endTime)
                                        .startOf("minute")
                                        .diff(
                                          dayjs(startTime).startOf("minute"),
                                          "minutes",
                                        )}
                                    />
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {worklog.description}
                              </span>
                              <span className="text-sm text-gray-500">
                                <TimeRange
                                  startTime={startTime}
                                  endTime={endTime}
                                />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600" />
            </div>
          )}

          {!loading && hasMore && (
            <div className="flex justify-center">
              <span className="text-blue-500 cursor-pointer" onClick={loadMore}>
                {t("load_more")}
              </span>
            </div>
          )}
        </div>
      </div>
      <StartWorkModal
        opened={startWorkModalOpen}
        onClose={() => setStartWorkModalOpen(false)}
        onConfirm={() => {
          setStartWorkModalOpen(false);
          void refreshData();
        }}
      />
      <MarkWorkCompleteModal
        opened={markWorkCompleteModalOpen}
        worklog={inProgressWork}
        onClose={() => setMarkWorkCompleteModalOpen(false)}
        onConfirm={() => {
          setMarkWorkCompleteModalOpen(false);
          void refreshData();
        }}
      />
      <LogCompletedWorkModal
        opened={logCompletedWorkModalOpen}
        onClose={() => setLogCompletedWorkModalOpen(false)}
        onConfirm={() => {
          setLogCompletedWorkModalOpen(false);
          void refreshData();
        }}
      />
    </div>
  );
}
