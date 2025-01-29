const getElement = (selector, root = document) => root.querySelector(selector);

const msgerForm = getElement(".chat__conversation-panel");
const msgerInput = getElement(".chat__conversation-panel__input");
const repliesContainer = getElement(
  ".chat__conversation-panel__reply-messages__container",
);
const msgerChat = getElement(".chat__conversation-board");
const emojiButton = getElement(".emoji-button");
const sendButton = getElement(".send-message-button");
const textArea = getElement(".textarea");
const fileInput = document.getElementById("fileInput");
const textDiv = document.getElementById("text");
const maxCharacters = 2000;
const iAmTheSender = "Мое имя";
const anotherSender = "Чужое имя";
const numEmojis = 60;
let selectedEmojiCode = null;
let selectedEmojiBigSvgSrc = null;
const emojiCodes = [
  "🥰", "🤧", "🤮", "🤔", "😭", "😉",
  "🤬", "🤯", "😇", "😷", "🤫", "🤥",
  "🤡", "😓", "😊", "😪", "🤐", "😂",
  "😲", "🥺", "🤭", "😟", "😣", "😶",
  "😵", "🤷", "🤷‍♂️", "🤦‍♀️", "🤦‍♂️", "🙏",
  "👋", "👌", "👍", "👎", "👏", "💪",
  "🤚", "🤟", "🤙", "🤛", "🤜", "🤝",
  "🤞", "🙌", "🖐", "✔", "❣", "❗", "❌",
  "❓", "⌛", "❤", "💋", "⚡", "👀",
  "💰", "🔝", "🔥", "🌛","💩",
];

const escapeHTML = (str) => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

const appendReply = (id, isMyReply) => {
  const messageContainer = getElement(`#message-container-${id}`);
  const replies = document.querySelectorAll(
    ".chat__conversation-panel__reply-messages__container > div",
  );
  const message = getElement(`#message-${id}`);
  replies.forEach((reply) => {
    const spans = reply.querySelectorAll("span");
    spans.forEach((span) => {
      span.querySelector(".msg-info-name")?.classList?.value;
    });
    reply.style.justifyContent = isMyReply ? "right" : "left";
    messageContainer.appendChild(reply);
    messageContainer.appendChild(message);
  });
};

const sendMessage = (senderName, files = [], emojiSvgPath) => {
  const id = _.uniqueId();
  const senderNameSafe = escapeHTML(senderName);
  if (files.length > 0) {
    const filePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(filePromises)
      .then((fileURLs) => {
        const fileMessages = fileURLs.map((fileURL, index) => {
          const file = files[index];
          const fileName = file.name;
          return `<a href="${fileURL}" download="${fileName}" class="file-container">
            <div class="file-icon">&#128196;</div>
            <div class="file-info">
              <div class="file-name">${fileName}</div>
            </div>
          </a>`;
        });
        const messageContent = fileMessages.join("");
        appendMessage(
          senderNameSafe,
          messageContent,
          id,
          senderNameSafe === iAmTheSender,
        );
        appendReply(id, senderNameSafe === iAmTheSender);
      })
      .catch((error) => {
        console.error("Error reading files:", error);
      });
  } else {
    const msgText = escapeHTML(msgerInput.innerText.trim());
    if (!msgText && !emojiSvgPath) return;
    const onlyEmojiSpan = textAreaContainsOnlyEmoji(msgText);
    const isContainerWithReplies = repliesContainer.querySelector('div') !== null;
    if (onlyEmojiSpan && !isContainerWithReplies) {
      sendEmojiMessage(
        senderNameSafe,
        selectedEmojiBigSvgSrc,
        selectedEmojiCode,
      );
    } else {
      appendMessage(
        senderNameSafe,
        msgText,
        id,
        senderNameSafe === iAmTheSender,
      );
      appendReply(id, senderNameSafe === iAmTheSender);
    }
  }
  msgerInput.textContent = "";
  const allMessageWithRepliesContainer =
    document.querySelectorAll(".message-copy");
  const messageWithRepliesContainerCss = {
    background: "rgb(221 218 218)",
    "border-radius": "5px",
  };
  allMessageWithRepliesContainer.forEach((container) => {
    container
      .querySelectorAll(".closeModal")
      .forEach((modal) => modal.remove());
    container.parentElement.style.cssText = Object.entries(
      messageWithRepliesContainerCss,
    )
      .map(([key, value]) => `${key}:${value}`)
      .join(";");
    container.querySelector(
      ".chat__conversation-board__message__context",
    ).style.borderLeft = "3px solid #ef6a0b";
    container.style.justifyContent =
      senderNameSafe === iAmTheSender ? "right" : "left";
  });
  msgerChat.scrollTop = msgerChat.scrollHeight;
};

const textAreaContainsOnlyEmoji = (input) => {
  const emojiRegex = /^[\u{1F000}-\u{1FFFF}]$/u;
  const textInput = document.getElementById("text").textContent;
  if (
    emojiRegex.test(textInput) ||
    /^(🤷‍♂️|🤦‍♀️|🤦‍♂️|❌|❓|✅|✔|❣|❗|⌛|❤|⚡)$/.test(textInput)
  ) {
    return input;
  }
  return null;
};

const appendMessage = (senderName, content, id, isMyMessage) => {
  const senderNameSafe = escapeHTML(senderName);
  const messageContainerId = `message-container-${id}`;
  const messageId = `message-${id}`;
  const repliesContainer = getElement(".chat__conversation-panel__reply-messages__container");
  const isRepliesContainerEmpty = repliesContainer.childElementCount;
  const spanStyle = isRepliesContainerEmpty ? "width: 19em;" : "";
  const messageContainerClass = `chat__conversation-board__message-container reversed ${isMyMessage ? "my-message" : "not-my-message"}`;
  const messageContextClass = "chat__conversation-board__message__context";
  const messageBubbleClass = "chat__conversation-board__message__bubble";
  const messageInfoContainerClass = "msg-info-container";
  const messageInfoNameClass = `${isMyMessage ? "my-info-name" : "not-my-info-name"}`;
  const messageInfoTimeClass = "msg-info-time";
  const senderOptionsClass = isMyMessage ? "chat__conversation-board__message__options" : "chat__conversation-board__message__options__for__another__sender";
  const senderDropdownContentClass = isMyMessage ? "dropdown-content" : "another-sender-dropdown-content";
  const linkIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-box-arrow-up-right link-svg" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
      <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
    </svg>
  `;
  const isAbsoluteUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  const regularExpression = /((?<!\S)(https?:\/\/)?(www\.)?([а-яА-ЯёЁ0-9_-]+(?:\.[яА-ЯёЁ0-9_-]+)*\.(?:рф|дети|москва|рус|сайт|онлайн|орг{2,}))(?:\/[^\s]*)?(?=\s|$))|((?:http|ftp|https):\/\/(?:www\.)?([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*)|www\.([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*))/g;
  const formattedContent = content.replace(regularExpression, (url) => {
    const absoluteUrl = isAbsoluteUrl(url) ? url : `https://${url}`;
    return `
      <div class="link-container">
        <a href="${absoluteUrl}" target="_blank" class="link" title="${url}">
          ${linkIconSVG}
          <span class="link-text">${getShortenedLink(url)}</span>
        </a>
      </div>`
  });
  const isOnlyEmoji = /^<img.*class="emoji-image".*>$/.test(formattedContent);
  const msgHTML = `
    <div id="${messageContainerId}" class="main-message-container">
      <div id="${messageId}" class="${messageContainerClass}">
        <div class="${messageContextClass}">
          <div class="${messageBubbleClass}">
            <span style="${spanStyle}" class="${isOnlyEmoji ? "emoji-only-message" : isMyMessage ? "green" : "white"}">${formattedContent}
              <div class="${messageInfoContainerClass}">
                <div class="${messageInfoNameClass}">${senderNameSafe}</div>
                <div class="${messageInfoTimeClass}">${formatDate(new Date())}</div>
              </div>
            </span>
          </div>
        </div>
        <div class="${senderOptionsClass}">
          <button onclick="showDropdownMenu(${id});" class="dropbtn btn-icon option-item more-button">
            <div class="dropdown">
              <div id="myDropdown-${id}" class="${senderDropdownContentClass}">
                <a id="reply-${id}" class="reply" href="#">Ответить</a>
                <a id="forward-${id}" class="forward" href="#">Переслать</a>
                <a id="delete-message-${id}" class="delete-message" href="#">Удалить</a>
              </div>
            </div>
            <svg class="feather feather-more-horizontal sc-dnqmqq jxshSx" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
};

const MAX_LINK_LENGTH = 40;

const getShortenedLink = (url) => {
  if (url.length <= MAX_LINK_LENGTH) {
    return url;
  } else {
    return url.substr(0, MAX_LINK_LENGTH - 3) + "...";
  }
};

const formatDate = (date) => {
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const showDropdownMenu = (id) =>
  getElement(`#myDropdown-${id}`).classList.toggle("show_message_menu");

const showFile = (input) => {
  const files = Array.from(input.files);
  sendMessage(escapeHTML(iAmTheSender), files);
  fileInput.value = '';
};

const displayFile = (fileURL, fileName) => {
  const fileContainer = document.createElement("div");
  fileContainer.classList.add("file-container");
  const fileIcon = document.createElement("div");
  fileIcon.classList.add("file-icon");
  const fileIconImage = document.createElement("i");
  fileIconImage.classList.add("far", "fa-file");
  fileIcon.appendChild(fileIconImage);
  const fileInfo = document.createElement("div");
  fileInfo.classList.add("file-info");
  const fileNameElement = document.createElement("div");
  fileNameElement.classList.add("file-name");
  fileNameElement.textContent = fileName;
  const fileLink = document.createElement("a");
  fileLink.href = fileURL;
  fileLink.target = "_blank";
  fileLink.textContent = "Посмотреть файл";
  s;
  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-button");
  const removeButtonIcon = document.createElement("i");
  removeButtonIcon.classList.add("far", "fa-trash-alt");
  removeButton.appendChild(removeButtonIcon);
  removeButton.addEventListener("click", () => {
    fileContainer.remove();
  });
  fileInfo.appendChild(fileNameElement);
  fileInfo.appendChild(fileLink);
  fileContainer.appendChild(fileIcon);
  fileContainer.appendChild(fileInfo);
  fileContainer.appendChild(removeButton);
  msgerChat.appendChild(fileContainer);
  msgerChat.scrollTop = msgerChat.scrollHeight;
};

const createForwardPopup = (id) => {
  const forwardPopup = document.createElement("div");
  forwardPopup.classList.add("popup");
  forwardPopup.id = "forwardPopup";
  const sendForwardButton = document.createElement("button");
  sendForwardButton.classList.add("sendForwardButton");
  sendForwardButton.textContent = "Переслать";
  sendForwardButton.addEventListener("click", () => {
    hideForwardPopup(forwardPopup);
  });
  const cancelButton = document.createElement("button");
  cancelButton.classList.add("cancelButton");
  cancelButton.textContent = "Отмена";
  cancelButton.addEventListener("click", () => hideForwardPopup(forwardPopup));
  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("buttons-container");
  buttonsContainer.appendChild(cancelButton);
  buttonsContainer.appendChild(sendForwardButton);
  forwardPopup.appendChild(buttonsContainer);
  return forwardPopup;
};

const showForwardPopup = (id) => {
  if (typeof id !== "string") {
    console.error("Invalid id for showForwardPopup");
    return;
  }
  let forwardPopup = document.querySelector("#forwardPopup");
  let overlay = document.querySelector(".overlay");
  if (!forwardPopup) {
    forwardPopup = createForwardPopup(id);
    document.body.appendChild(forwardPopup);
    msgerChat.classList.add("forward-popup-open");
  }
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("overlay");
    msgerChat.appendChild(overlay);
  }
  forwardPopup.classList.add("show");
  msgerChat.addEventListener("wheel", preventChatScrolling, {
    passive: false,
  });
  document.body.addEventListener("wheel", preventChatScrolling, {
    passive: false,
  });
};

const hideForwardPopup = (forwardPopup) => {
  forwardPopup.classList.remove("show");
  forwardPopup.remove();
  msgerChat.classList.remove("forward-popup-open");
  const overlay = document.querySelector(".overlay");
  if (overlay) overlay.remove();
  msgerChat.removeEventListener("wheel", preventChatScrolling);
  document.body.removeEventListener("wheel", preventChatScrolling);
};

const sendEmojiMessage = (senderName, svgPath, emoji) => {
  const senderNameSafe = escapeHTML(senderName);
  const id = _.uniqueId();
  const msgContent = `<img src="${svgPath}" alt="${emoji}" width="128" height="128" class="emoji-image" />`;
  appendMessage(
    senderNameSafe,
    msgContent,
    id,
    senderNameSafe === iAmTheSender,
  );
};

const preventChatScrolling = (event) => {
  if (msgerChat.classList.contains("forward-popup-open"))
    event.preventDefault();
};

const handleSendButtonClick = (event) => {
  event.preventDefault();
  sendMessage(escapeHTML(iAmTheSender));
  const dropdownEmojies = getElement(".dropdown-emoji");
  if (dropdownEmojies) dropdownEmojies.remove(emojiButton);
};

const handleMessageInputSubmit = (event) => {
  event.preventDefault();
  const msgText = escapeHTML(msgerInput.innerText.trim());
  const onlyEmojiTextArea = textAreaContainsOnlyEmoji(msgText);
  if (onlyEmojiTextArea) {
    const emojiSvgPath = getSvgPathForEmoji(selectedEmojiBigSvgSrc);
    sendMessage(escapeHTML(iAmTheSender), [], emojiSvgPath);
  } else {
    sendMessage(escapeHTML(iAmTheSender));
  }
  msgerInput.textContent = "";
  selectedEmojiCode = null;
  selectedEmojiBigSvgSrc = null;
};

const getSvgPathForEmoji = (emojiCode) => {
  const emojiPrefix = "emojies/256/";
  const emojiSuffix = ".svg";
  if (emojiCode >= 1 && emojiCode <= numEmojis) {
    return `${emojiPrefix}${emojiCode}${emojiSuffix}`;
  } else {
    console.error("Invalid emoji code:", emojiCode);
    return "";
  }
};

const handleTextAreaShiftEnterKeyPress = (event) => {
  if (event.which === 13 && !event.shiftKey) {
    event.preventDefault();
    sendMessage(escapeHTML(iAmTheSender));
    const dropdownEmojies = getElement(".dropdown-emoji");
    if (dropdownEmojies) dropdownEmojies.remove(emojiButton);
  }
};

const handleTextAreaCtrlEnterKeyPress = (event) => {
  if (event.key === "Enter" && event.ctrlKey) {
    document.execCommand("insertLineBreak", false, null);
    msgerInput.scrollTop = msgerInput.scrollHeight;
    event.preventDefault();
  }
};

const handleEmojiButtonClick = (event) => {
  event.preventDefault();
  const parentContainer = getElement(".chat__conversation-panel");
  const replyContainer = getElement(
    ".chat__conversation-panel__reply-messages__container",
  );
  const updateChildContainerHeight = () => {
    const childContainer = getElement(".dropdown-content-emojies");
    if (childContainer) {
      const parentHeight = parentContainer.offsetHeight;
      childContainer.style.marginBottom = `${parentHeight * 0.5 - 33}px`;
    }
    if (childContainer && replyContainer) {
      const parentHeight =
        parentContainer.offsetHeight + replyContainer.offsetHeight;
      childContainer.style.marginBottom = `${parentHeight * 0.5 - 33}px`;
    }
  };
  const resizeObserver = new ResizeObserver(updateChildContainerHeight);
  resizeObserver.observe(parentContainer);
  const emojiHTML = ` <div class="dropdown-emoji"><div class="dropdown-content-emojies"> ${Array.from(
    {
      length: numEmojis,
    },
    (_, index) =>
      ` <a id="emoji-${index + 1}" class="emoji-shake" data-emoji-code="${emojiCodes[index]
      }" data-big-emoji-src="emojies/${index + 1}.svg">${emojiCodes[index]
      }</a> `,
  ).join("")} </div></div> `;
  const dropdownEmojies = getElement(".dropdown-emoji");
  const textInput = document.getElementById("text");
  if (!dropdownEmojies) {
    emojiButton.insertAdjacentHTML("afterbegin", emojiHTML);
    getElement(".dropdown-content-emojies").classList.toggle(
      "show_emojies_menu",
    );
    textInput.focus();
  }
  if (dropdownEmojies) dropdownEmojies.remove(emojiButton);
  document
    .querySelectorAll(".dropdown-content-emojies a[data-emoji-code]")
    .forEach((emoji) => {
      emoji.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const textInput = document.getElementById("text");
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        if (textInput.contains(range.commonAncestorContainer)) {
          selectedEmojiCode = emoji.getAttribute("data-emoji-code");
          selectedEmojiBigSvgSrc = emoji.getAttribute("data-big-emoji-src");
          const emojiNode = document.createTextNode(selectedEmojiCode);
          range.deleteContents();
          range.insertNode(emojiNode);
          range.setStartAfter(emojiNode);
          range.setEndAfter(emojiNode);
          selection.removeAllRanges();
          selection.addRange(range);
          const inputEvent = new Event("input", {
            bubbles: true,
          });
          textInput.dispatchEvent(inputEvent);
        }
      });
    });
};

const handleDocumentClick = (event) => {
  let replyIndex = 0;
  const cloneAndProcessElement = (element) => {
    const elementClone = element.cloneNode(true);
    const deleteReplyDiv = document.createElement("div");
    const deleteReplyButton = document.createElement("a");
    const replyMessageSpanCss = {
      width: "19em",
    };
    elementClone.classList.remove("chat__conversation-board__message__options");
    elementClone.classList.remove(
      "chat__conversation-board__message__options__for__another__sender",
    );
    elementClone.classList.remove(
      "chat__conversation-board__message-container",
    );
    elementClone.classList.remove("reversed");
    elementClone.classList.add("message-copy");
    elementClone.style.justifyContent = "left";
    deleteReplyDiv.classList.add(
      "chat__conversation-board__reply-message__options",
    );
    deleteReplyButton.classList.add("closeModal");
    deleteReplyDiv.appendChild(deleteReplyButton);
    elementClone.appendChild(deleteReplyDiv);
    elementClone.setAttribute("data-reply-index", replyIndex++);
    const replySpans = elementClone.querySelectorAll(
      ".chat__conversation-board__message__bubble > span",
    );
    replySpans.forEach((span) => {
      span.querySelector(".msg-info-name")?.classList?.value;
      span.style.cssText = Object.entries(replyMessageSpanCss)
        .map(([key, value]) => `${key}:${value}`)
        .join(";");
    });
    const replyContainerSpans = elementClone.querySelectorAll(
      ".chat__conversation-panel__reply-messages__container span",
    );
    replyContainerSpans.forEach((span) => {
      span.querySelector(".msg-info-name")?.classList?.value;
    });
    repliesContainer.appendChild(elementClone);
  };
  if (event.target.matches(".reply")) {
    const reply = event.target.id;
    const message = document
      .getElementById(reply)
      .closest(".chat__conversation-board__message-container");
    const elementsOnSameLevel = Array.from(
      message.parentElement.children,
    ).filter((child) => child.tagName === "DIV");
    elementsOnSameLevel.forEach(cloneAndProcessElement);
  }
  if (event.target.matches(".forward")) {
    const forwardMessage = event.target.id;
    const message = document
      .getElementById(forwardMessage)
      .closest(".main-message-container");
    if (message) {
      showForwardPopup(message.id);
    }
  }
  if (event.target.matches(".delete-message")) {
    const deleteMessage = event.target.id;
    const message = document
      .getElementById(deleteMessage)
      .closest(".main-message-container");
    message.remove();
  }
  if (event.target.matches(".closeModal")) {
    const deleteReply = event.target.closest(".message-copy");
    deleteReply.remove();
  }
};

const handleDocumentMouseOver = (event) => {
  const emojiOnlyMessage = event.target.closest(".emoji-only-message");
  if (emojiOnlyMessage && !emojiOnlyMessage.closest(".my-message")) {
    emojiOnlyMessage.style.background = "#fff";
    const msgInfoContainer = emojiOnlyMessage.querySelector(
      ".msg-info-container",
    );
    msgInfoContainer.style.visibility = "visible";
  } else if (emojiOnlyMessage && !emojiOnlyMessage.closest(".not-my-message")) {
    emojiOnlyMessage.style.background = "#d6ffe0";
    const msgInfoContainer = emojiOnlyMessage.querySelector(
      ".msg-info-container",
    );
    msgInfoContainer.style.visibility = "visible";
  }
};

const handleDocumentMouseOut = (event) => {
  const emojiOnlyMessage = event.target.closest(".emoji-only-message");
  if (emojiOnlyMessage) {
    emojiOnlyMessage.style.background = "";
    const msgInfoContainer = emojiOnlyMessage.querySelector(
      ".msg-info-container",
    );
    msgInfoContainer.style.visibility = "hidden";
  }
};

textDiv.addEventListener("paste", (event) => {
  event.preventDefault();
  const clipboardData = event.clipboardData || window.clipboardData;
  const pastedText = clipboardData.getData("text/plain").trim();
  document.execCommand("insertHTML", false, pastedText);
});

textDiv.addEventListener("input", () => {
  const content = textDiv.textContent;
  if (content.length > maxCharacters) {
    textDiv.textContent = content.slice(0, maxCharacters);
  }
});

document.addEventListener("click", (event) => {
  const deleteReply = event.target.closest(".message-copy");
  const deleteButton = event.target.closest(".delete-message");
  if (deleteReply && deleteButton) {
    deleteReply.remove();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector('#chat')) {
    const firstUnreadMessage = document.querySelector('.unread-message');
    const unreadMessagesLegend = document.createElement("div");
    unreadMessagesLegend.classList.add("unread-messages-legend");
    unreadMessagesLegend.textContent = "Непрочитанные сообщения";

    if (firstUnreadMessage) {
      msgerChat.insertBefore(unreadMessagesLegend, firstUnreadMessage);
      unreadMessagesLegend.scrollIntoView({ behavior: 'smooth' });

      const observer = new MutationObserver(() => {
        if (!firstUnreadMessage.classList.contains('unread-message')) {
          unreadMessagesLegend.remove();
          observer.disconnect();
        }
      });

      observer.observe(firstUnreadMessage, { attributes: true });
    } else {
      msgerChat.scrollTop = msgerChat.scrollHeight;
    }
  }
});

sendButton.addEventListener("click", handleSendButtonClick);

msgerForm.addEventListener("submit", handleMessageInputSubmit);

textArea.addEventListener("keypress", handleTextAreaShiftEnterKeyPress);

textArea.addEventListener("keydown", handleTextAreaCtrlEnterKeyPress);

emojiButton.addEventListener("click", handleEmojiButtonClick);

document.addEventListener("mouseover", handleDocumentMouseOver);

document.addEventListener("mouseout", handleDocumentMouseOut);

fileInput.addEventListener("change", () => showFile(fileInput));

document.onclick = handleDocumentClick;
