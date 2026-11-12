import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/index.ts";
import { ErrorNote } from "../components/Feedback.tsx";
import { formatDate } from "../format.ts";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: ["notifications"], queryFn: () => api.notifications() });
  const mark = useMutation({
    mutationFn: (id: number) => api.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="page">
      <div className="page-head">
        <p className="eyebrow">알림</p>
        <h1>받은 알림</h1>
      </div>
      <ErrorNote error={list.error ?? mark.error} />
      {list.data?.items.length === 0 ? <p className="muted">알림이 없습니다.</p> : null}
      <div className="stack">
        {list.data?.items.map((item) => (
          <article key={item.notificationId} className="card between">
            <div>
              <h2>{item.title}</h2>
              <p className="meta">
                {item.type} · {formatDate(item.sentAt)} · {item.readAt ? "읽음" : "안 읽음"}
              </p>
            </div>
            {item.readAt ? null : (
              <button className="btn" type="button" onClick={() => mark.mutate(item.notificationId)}>
                읽음
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
