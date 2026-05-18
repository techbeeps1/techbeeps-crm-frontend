import { useState, useEffect } from 'react';
import { setFormField, resetForm } from '../Redux/formSlice';
import { useDispatch, useSelector } from 'react-redux';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import EditNewsItem from '../EditTemplateForm/Communication/editNewsItem';

function NewsItems() {
  const [showNewsItemsFrom, setShowNewsItemsFrom] = useState(false);
  const [newsItemList, setNewsItemList] = useState([] as any);
  const [selectedNewsItem, setSelectedNewsItem] = useState([] as any);
  const [totalNewsItem, setTotalNewsItem] = useState(0);
  const [currentNewsItemPage, setCurrentNewsItemPage] = useState(1);
  const [isNewsItemSelected, setIsNewsItemSelected] = useState(false);
  const staffPageSize = 5;

  const newsItemsForm = 'newsItems';
  const formState = useSelector((state: any) => state.forms[newsItemsForm]);
  const dispatch = useDispatch();

  function getNewsItemList() {
    axios
      .get(
        `${apiPath}/Communication/newsItemsList?page=${currentNewsItemPage}&pageSize=${staffPageSize}`,
      )
      .then((response) => {
        setNewsItemList(response.data.newsItemsList);
        setTotalNewsItem(response.data.totalNewsItem);
      })
      .catch((error) => {
        console.error('Error fetching staff data:', error);
      });
  }

  useEffect(() => {
    getNewsItemList();
  }, [currentNewsItemPage]);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({ formName: newsItemsForm, field: name, value } as any),
    );
    console.log(name, value);
  };

  const handleNewsItemClick = (newsItem: any) => {
    setSelectedNewsItem(newsItem);
    setIsNewsItemSelected(true);
    setShowNewsItemsFrom(false);
  };

  // create news item handlar
  const handleFormSubmission = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`${apiPath}/Communication/createNewsItem`, {
      method: 'POST',
      body: JSON.stringify(formState),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (response.ok) {
      getNewsItemList();
    }
    console.log('Form data to be saved:', data);
    dispatch(resetForm({ formName: newsItemsForm }));
  };

  // edit news item handlar
  const handleEditSupplierSubmit = async (editedData: any) => {
    try {
      const response = await fetch(
        `${apiPath}/Communication/editNewsItem/${editedData._id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editedData),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.ok) {
        getNewsItemList();
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
    setIsNewsItemSelected(false);
  };

  // delete news item handlar
  const deleteNewsItem = async (newsItemId: string) => {
    try {
      const response = await axios.delete(
        `${apiPath}/Communication/deleteNewsItem/${newsItemId}`,
      );
      if (response.data.status) {
        setNewsItemList(
          newsItemList.filter((newsItem: any) => newsItem._id !== newsItemId),
        );
        setIsNewsItemSelected(false);
      } else {
        console.error('Error deleting team:', response.data.msg);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-[20px] xl:flex-row item-center bg-white">
        <div>
          <div className="flex justify-between p-2">
            <button
              className="bg-blue-200 text-black active:bg-blue-500 
              font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
              type="button"
              onClick={() => {
                setShowNewsItemsFrom(true);
                setIsNewsItemSelected(false);
              }}
            >
              Create news item
            </button>
            <input
              type="search"
              className="border rounded-lg w-40 px-3 py-2 pl-10 pr-4 ml-20 focus:outline-none focus:border-blue-500"
              placeholder="To Search..."
            />
          </div>

          {/* news list item */}
          <div>
            <div className="col-span-2">
              <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                <div className="overflow-hidden">
                  <table className="min-w-full text-left text-sm font-light">
                    <tbody>
                      {newsItemList.map((newsItem: any, index: number) => (
                        <tr
                          key={newsItem._id}
                          className={`${
                            index % 2 === 0 ? 'bg-gray-100' : ''
                          } border-b dark:border-neutral-500`}
                        >
                          <th 
                          onClick={()=>handleNewsItemClick(newsItem)}
                          className="whitespace-nowrap px-6 py-4 cursor-pointer">
                          ✏️ 
                          </th>
                          <th className="whitespace-nowrap px-6 py-4">
                          {newsItem.title} <br />
                          <span className='font-medium'>{newsItem.body}</span>
                          </th>
                          <th
                            className="whitespace-nowrap px-6 py-4"
                          >
                            {new Date(newsItem.publishAt).toISOString().split('T')[0]} 
                          </th>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-l border-gray-300 flex-grow"></div>

        <div className="w-full xl:w-1/2 p-4">
          {showNewsItemsFrom && (
            <form onSubmit={handleFormSubmission}>
              <h1 className='text-center p-1'>Not yet published</h1>
              <div className="mb-4.5 ml-1">
                <label className="mb-2.5 ml-2 block text-black dark:text-white">
                  NEW ITEM
                </label>
                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <input
                    type="text"
                    placeholder="New Item"
                    className="w-full xl:w-[18rem] ml-2 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="title"
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <textarea
                id="chat"
                className="block mx-4 p-2.5 w-full xl:w-[18rem] h-100 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                name="body"
                onChange={handleFormChange}
                required
              ></textarea>
              <div className="container p-2">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Publish on
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <input
                      type="date"
                      placeholder="New Item"
                      className="w-50  rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="publishAt"
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div>
                  <button
                    className="bg-blue-200 text-black active:bg-blue-500 mt-9
       font-bold px-6 py-3 ml-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => deleteNewsItem(selectedNewsItem._id)}
                  >
                    Delete message
                  </button>
                  <button
                    className="bg-blue-200 text-black active:bg-blue-500 mt-9
       font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                    type="submit"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </form>
          )}
          {isNewsItemSelected && (
            <EditNewsItem
              newsItemData={selectedNewsItem}
              handleEditSubmit={handleEditSupplierSubmit}
              deleteNewsItem={deleteNewsItem}
              handleCloseEditForm={setIsNewsItemSelected}
            ></EditNewsItem>
          )}
        </div>
      </div>
    </>
  );
}

export default NewsItems;
