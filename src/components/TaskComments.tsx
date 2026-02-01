import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { Comment } from "src/types";

export const TaskComments = ({ taskId }: { taskId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("taskId", "==", taskId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            taskId: data.taskId,
            message: data.message,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        };
      }) as Comment[];
      setComments(fetched);
    });

    return () => unsub();
  }, [taskId]);

  return (
    <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
      <strong style={{ fontSize: '13px' }}>Keskustelu:</strong>
      {comments.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#8e8e93' }}>Ei viestejä vielä.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} style={commentBubbleStyle}>
            <p style={{ margin: 0 }}>{c.message}</p>
            <span style={{ fontSize: '10px', color: '#8e8e93' }}>
              {new Date(c.createdAt).toLocaleString('fi-FI', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

const commentBubbleStyle = {
  backgroundColor: '#f1f1f1',
  padding: '8px 12px',
  borderRadius: '12px',
  marginTop: '8px',
  fontSize: '13px',
  maxWidth: '90%'
};