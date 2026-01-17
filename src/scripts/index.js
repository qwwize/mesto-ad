/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { getUserInfo, getCardList, setUserInfo, updateAvatar, addCard, deleteCard, changeLikeCardStatus } from "./components/api.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");
const usersStatsModalUserList = usersStatsModalWindow.querySelector(".popup__list");

const logoElement = document.querySelector(".header__logo");

let currentUserId = null;
let cardToDelete = null;
let cardElementToDelete = null;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const infoItem = template.content.cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch(() => {})
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Сохранение...";
  submitButton.disabled = true;

  updateAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      avatarForm.reset();
      closeModalWindow(avatarFormModalWindow);
    })
    .catch(() => {})
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Создание...";
  submitButton.disabled = true;

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(
          newCard,
          currentUserId,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCardClick,
          }
        )
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch(() => {})
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleLikeCard = (cardID, isLiked, likeButton, likeCountElement) => {
  changeLikeCardStatus(cardID, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch(() => {});
};

const handleDeleteCardClick = (cardID, cardElement) => {
  cardToDelete = cardID;
  cardElementToDelete = cardElement;
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = removeCardForm.querySelector(".popup__button");
  const originalText = submitButton.textContent;
  submitButton.textContent = "Удаление...";
  submitButton.disabled = true;

  deleteCard(cardToDelete)
    .then(() => {
      cardElementToDelete.remove();
      closeModalWindow(removeCardModalWindow);
      cardToDelete = null;
      cardElementToDelete = null;
    })
    .catch(() => {})
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleLogoClick = () => {
  while (usersStatsModalInfoList.firstChild) {
    usersStatsModalInfoList.removeChild(usersStatsModalInfoList.firstChild);
  }
  while (usersStatsModalUserList.firstChild) {
    usersStatsModalUserList.removeChild(usersStatsModalUserList.firstChild);
  }

  getCardList()
    .then((cards) => {
      const sortedCards = [...cards].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      usersStatsModalTitle.textContent = "Статистика";

      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", cards.length.toString())
      );

      if (sortedCards.length > 0) {
        usersStatsModalInfoList.append(
          createInfoString(
            "Первая создана:",
            formatDate(new Date(sortedCards[sortedCards.length - 1].createdAt))
          )
        );
        usersStatsModalInfoList.append(
          createInfoString(
            "Последняя создана:",
            formatDate(new Date(sortedCards[0].createdAt))
          )
        );
      }

      const usersMap = new Map();
      cards.forEach((card) => {
        const userId = card.owner._id;
        if (!usersMap.has(userId)) {
          usersMap.set(userId, {
            name: card.owner.name,
            avatar: card.owner.avatar,
            cardsCount: 0,
          });
        }
        usersMap.get(userId).cardsCount++;
      });

      usersStatsModalText.textContent = "Пользователи:";

      const userTemplate = document.getElementById("popup-info-user-preview-template");
      usersMap.forEach((userData) => {
        const userItem = userTemplate.content.cloneNode(true);
        const listItem = userItem.querySelector(".popup__list-item");
        listItem.textContent = `${userData.name} (${userData.cardsCount})`;
        if (userData.avatar) {
          listItem.style.backgroundImage = `url(${userData.avatar})`;
        }
        usersStatsModalUserList.append(userItem);
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch(() => {});
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

logoElement.addEventListener("click", handleLogoClick);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          cardData,
          currentUserId,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCardClick,
          }
        )
      );
    });
  })
  .catch(() => {});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

const removeCardCloseButton = removeCardModalWindow.querySelector(".popup__close");
removeCardCloseButton.addEventListener("click", () => {
  closeModalWindow(removeCardModalWindow);
  cardToDelete = null;
  cardElementToDelete = null;
});

enableValidation(validationSettings);
