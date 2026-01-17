const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  cardData,
  currentUserId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardElement.querySelector(".card__title").textContent = cardData.name;

  const likesCount = cardData.likes ? cardData.likes.length : 0;
  likeCountElement.textContent = likesCount;

  const isLiked = cardData.likes && cardData.likes.some(like => like._id === currentUserId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }
  if (cardData.owner._id !== currentUserId) {
    deleteButton.remove();
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(cardData._id, isLiked, likeButton, likeCountElement));
  }

  if (onDeleteCard && cardData.owner._id === currentUserId) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardData._id, cardElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: cardData.name, link: cardData.link}));
  }

  return cardElement;
};
