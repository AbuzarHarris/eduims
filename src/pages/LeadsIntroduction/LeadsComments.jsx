import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserData } from "../../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addNewComment,
  deleteCommentByID,
  fetchAllLeadComments,
} from "../../api/LeadsIntroductionCommentsData";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Controller, useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { Mention } from "primereact/mention";
import { Button } from "primereact/button";
import { ROUTE_URLS } from "../../utils/enums";
import { Dialog } from "primereact/dialog";
import { CIconButton } from "../../components/Buttons/CButtons";
import TextInput from "../../components/Forms/TextInput";
import { InputText } from "primereact/inputtext";
import { ContextMenu } from "primereact/contextmenu";
import { confirmDialog } from "primereact/confirmdialog";

const LeadsComments = () => {
  const { LeadIntroductionID } = useParams();
  const navigate = useNavigate();
  const user = useUserData();

  const commentDialogRef = useRef();

  return (
    <LeadCommentProivder>
      <div className="flex flex-column h-full" style={{ minHeight: "90vh" }}>
        {/* <div className="s-sb">
        <Button
          onClick={() => navigate(ROUTE_URLS.LEAD_INTRODUCTION_ROUTE)}
          type="button"
          icon="pi pi-arrow-left"
          label="Back to Leads"
          className="rounded"
        />
        <Button
          onClick={() => commentDialogRef.current?.setVisible(true)}
          type="button"
          icon="pi pi-plus"
          label="Add New Comment"
          className="rounded"
          severity="success"
        />
      </div> */}

        <div className="flex-grow-1 w-full relative overflow-y-scroll">
          <div className="absolute top-0 left-0 right-0 bottom-2">
            <CommentsContainer
              LeadIntroductionID={LeadIntroductionID}
              user={user}
            />
          </div>
        </div>
        <div className="flex-none w-full">
          <CreateCommentInput
            LeadIntroductionID={LeadIntroductionID}
            user={user}
          />
        </div>
      </div>
    </LeadCommentProivder>
  );
};

const CONTEXT_ACTIONS = {
  EDIT_ACTION: "Edit",
  DELETE_ACTION: "Delete",
};

const CommentsContainer = ({ LeadIntroductionID, user }) => {
  const queryClient = useQueryClient();
  const [commentID, setCommentID] = useState(null);
  const [commentText, setCommentText] = useState(null);
  const { data } = useQuery({
    queryKey: ["leadComments"],
    queryFn: () =>
      fetchAllLeadComments({
        LeadIntroductionID: LeadIntroductionID,
        LoginUserID: user.userID,
      }),
  });

  const { setComment } = useContext(LeadCommentContext);

  const cm = useRef(null);

  const items = [
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: () => {
        handleClick(commentID, CONTEXT_ACTIONS.EDIT_ACTION, commentText);
      },
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: () => {
        handleClick(commentID, CONTEXT_ACTIONS.DELETE_ACTION);
      },
    },
  ];

  const onRightClick = (event, commentId, commentText = "") => {
    if (cm.current) {
      setCommentID(commentId);
      if (commentText !== "") {
        setCommentText(commentText);
      }
      cm.current.show(event);
    }
  };

  function handleClick(id, action, comment = "") {
    if (action === CONTEXT_ACTIONS.EDIT_ACTION) {
      handleEdit(id, comment);
    } else if (action === CONTEXT_ACTIONS.DELETE_ACTION) {
      confirmDialog({
        message: "Are you sure you want to delete this comment?",
        header: "Confirmation",
        icon: "pi pi-info-circle",
        defaultFocus: "reject",
        acceptClassName: "p-button-danger",
        position: "top",
        accept: () => handleDelete(id),
        reject: () => {},
      });
    } else {
      console.log("Wrong Action");
    }
  }

  const deleteMutation = useMutation({
    mutationFn: deleteCommentByID,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadComments"] });
    },
  });

  function handleDelete(id) {
    deleteMutation.mutate({
      CommentID: id,
      LoginUserID: user.userID,
    });
  }

  function handleEdit(id, comment) {
    console.log(id, comment);
    setComment({
      CommentID: id,
      Comment: comment,
    });
  }

  return (
    <>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <ul className="w-full flex flex-column gap-2">
            {data?.length > 0 ? (
              data.map((comment, index) => (
                <React.Fragment key={comment.CommentID}>
                  <SingleComment
                    comment={comment}
                    user={user}
                    handleRightClick={onRightClick}
                    key={comment.CommentID}
                  />
                </React.Fragment>
              ))
            ) : (
              <li style={{ textAlign: "center" }}>
                <p>No Comments!</p>
              </li>
            )}
          </ul>
        </div>

        <ContextMenu
          ref={cm}
          model={items}
          onHide={() => {
            setCommentID(null);
            setCommentText(null);
          }}
          pt={{
            menu: {
              className: "m-0",
            },
          }}
        />
      </div>
    </>
  );
};

const SingleComment = ({ comment, user, handleRightClick }) => {
  return (
    <>
      <li
        className={classNames(
          "px-4 py-2 bg-primary  w-full rounded align-self-start",
          {
            "align-self-end ": comment.EntryUserID === user.userID,
          }
        )}
        style={{ maxWidth: "fit-content" }}
        onContextMenu={(event) => {
          if (comment.EntryUserID === user.userID) {
            handleRightClick(event, comment.CommentID, comment.Comment);
          }
        }}
      >
        <p className="p-0 m-0">{comment.FullName}</p>
        <span className="p-0 m-0">@{comment.UserName}</span>
        <p className="p-0 m-0">{comment.Comment}</p>
      </li>
    </>
  );
};

const CreateCommentInput = ({ LeadIntroductionID, user }) => {
  const queryClient = useQueryClient();
  const method = useForm({
    defaultValues: {
      Comment: "",
    },
  });
  const { comment, setComment } = useContext(LeadCommentContext);

  useEffect(() => {
    if (comment?.Comment !== null) {
      method.setValue("Comment", comment.Comment);
    }
  }, [comment]);

  const mutation = useMutation({
    mutationFn: addNewComment,
    onSuccess: ({ success }) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["leadComments"] });
        setComment({ CommentID: null, Comment: null });
        method.reset();
      }
    },
  });

  function onSubmit(data) {
    try {
      mutation.mutate({
        formData: data,
        LeadIntroductionID: LeadIntroductionID,
        userID: user.userID,
        CommentID: comment.CommentID ?? 0,
      });
    } catch (e) {
      toast.error(e.message, {
        autoClose: false,
      });
    }
  }

  return (
    <>
      <div className="py-2">
        <div className="flex align-items-center justify-content-between gap-2">
          <div className="flex-grow-1">
            <Controller
              id="Comment"
              name="Comment"
              control={method.control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <>
                  <InputText
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    ref={field.ref}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    placeholder="Type your comment..."
                    className={classNames("w-100 p-3", {
                      "p-invalid": fieldState.error,
                    })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value !== "") {
                        method.handleSubmit(onSubmit)();
                      }
                    }}
                  />
                </>
              )}
            />
          </div>
          <div className="flex-none align-self-stretch">
            <Button
              type="button"
              onClick={() => method.handleSubmit(onSubmit)()}
              icon="pi pi-send"
              tooltipOptions={{
                position: "left",
              }}
              tooltip="Send"
              severity="primary"
              pt={{
                root: {
                  className: "rounded h-full",
                },
                icon: {
                  className: "text-xl",
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadsComments;

const LeadCommentContext = createContext();

const LeadCommentProivder = ({ children }) => {
  const [comment, setComment] = useState({
    CommentID: null,
    Comment: null,
  });

  return (
    <LeadCommentContext.Provider value={{ comment, setComment }}>
      {children}
    </LeadCommentContext.Provider>
  );
};
